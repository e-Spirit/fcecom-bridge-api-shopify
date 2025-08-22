const { shopClient } = require('../utils/http-client');
const logger = require('../utils/logger');
const {
    GET_CATEGORIES,
    GET_CATEGORIES_BY_IDS,
    GET_TOTAL_CATEGORIES,
    GET_CATEGORY_BY_HANDLE,
    GET_CATEGORY_HANDLE_BY_ID
} = require('../queries/categories');

const LOGGING_NAME = 'CategoriesService';
const pageSize = 100;

const { DEFAULT_LANG } = process.env;

/**
 * Maps raw category data to a simplified structure with label translation support.
 *
 * @param {Array} categoryData - Array of category objects from Shopify.
 * @param {string} lang - Language for translation.
 * @returns {Array} Array of mapped category objects with id, label, and parentId.
 */
const mapCategoryData = (categoryData, lang) =>
    categoryData.map((category) => {
        let label = category.name?.default;

        if (lang && lang !== 'default' && Array.isArray(category.translations)) {
            const titleTranslation = category.translations.find((t) => t.key === 'title');
            if (titleTranslation && titleTranslation.value) {
                label = titleTranslation.value;
            }
        }
        return {
            id: category.id,
            label,
            parentId: category.parent_category_id ?? 'root'
        };
    });

/**
 * Checks if the parameter is a truthy value.
 * If the parameter is a string it also casts empty strings to undefined.
 * @param {any} value The value to be checked.
 * @return {boolean} if the value is truthy.
 */
const checkIfEmpty = (value) => {
    if (value === '') {
        value = undefined;
    }
    return Boolean(value);
};

/**
 * Recursively counts the total number of categories in a category tree structure.
 * @param {any[]} tree Category tree.
 * @returns {number} Total count of all categories including nested children.
 */
const countCategories = (tree) => tree.reduce((count, { children = [] }) => count + 1 + countCategories(children), 0);

/**
 * Recursively creates a nested tree structure for the given categories.
 * Shopify collections are by default flat resulting in a single level structure.
 *
 * @param {any[]} categories The arrays of categories to work with.
 * @param {string} [parentId=0] ID of the parent category.
 */
const buildCategoryTree = (categories, parentId = 'root') => {
    return categories
        .filter((category) => category.parentId === parentId)
        .map(({ id, label }) => {
            const children = buildCategoryTree(categories, id);
            return { id, label, ...(children?.length && { children }) };
        });
};

/**
 * Transforms the given nested category tree to a flat list.
 *
 * @param {any[]} categories Categories to transform to flat list.
 * @return {any[]} The categories as a flat list.
 */
const flattenCategories = (categories) => {
    return categories.reduce((result, { children, ...rest }) => {
        result.push(rest);
        if (children) {
            result.push(...flattenCategories(children));
        }
        return result;
    }, []);
};

/**
 * Fetches all collections (categories) from Shopify using GraphQL Admin API with cursor-based pagination.
 * @param {string} lang Language of the request.
 * @param {number} [page=1] Number of the page to retrieve.
 * @param {null} [afterCursor] The endCursor from the previous page for cursor-based pagination.
 * @param {string} [keyword=''] - Optional keyword to filter categories.
 * @returns {Promise<{ data: { data: any[], total: number, endCursor: string|null, hasNextPage: boolean } }>} Categories in expected format.
 */
const fetchCategories = async (lang, page = 1, afterCursor = null, keyword = '') => {
    const first = pageSize;
    //let afterClause = afterCursor ? ', after: $after' : '';
    const variables = {
        first,
        ...(afterCursor ? { after: afterCursor } : {}),
        locale: lang || DEFAULT_LANG,
        query: keyword ? `collection_type:custom AND title:*${keyword}*` : 'collection_type:custom'
    };

    logger.logDebug(
        LOGGING_NAME,
        `Performing GET request to /collections with body ${JSON.stringify(
            {
                query: GET_CATEGORIES,
                variables
            },
            null,
            2
        )}`
    );

    const response = await shopClient.post('/graphql.json', { query: GET_CATEGORIES, variables });

    const edges = response.data.data?.collections?.edges || [];
    const categories = edges.map(({ node }) => ({
        id: node.id.split('/').pop(),
        name: { default: node.title },
        handle: node.handle,
        parent_category_id: null,
        translations: node.translations
    }));

    const total = await getTotalCategories();
    const endCursor = response.data.data?.collections?.pageInfo?.endCursor || null;
    const hasNextPage = response.data.data?.collections?.pageInfo?.hasNextPage || false;

    return { data: { data: categories, total, endCursor, hasNextPage } };
};

/**
 * Fetches categories by their IDs from Shopify using GraphQL Admin API.
 *
 * @param {string[]} categoryIds Array of category IDs.
 * @param {string} lang Language for the request.
 * @returns {Promise<{ categories: Array<{ id: string, label: string }>, total: number }>}
 *   An object containing the mapped categories and their total count.
 */
const fetchCategoriesByIds = async (categoryIds, lang) => {
    if (!categoryIds || !categoryIds.length) return { categories: [], total: 0 };

    const variables = {
        ids: categoryIds.map((id) => `gid://shopify/Collection/${id}`),
        locale: lang || DEFAULT_LANG
    };

    const response = await shopClient.post('/graphql.json', { query: GET_CATEGORIES_BY_IDS, variables });
    const nodes = response.data.data?.nodes || [];

    const mappedData = nodes.filter(Boolean).map((collection) => {
        let label = collection.title;
        if (lang && lang !== 'default' && Array.isArray(collection.translations)) {
            const titleTranslation = collection.translations.find((title) => title.key === 'title');
            if (titleTranslation?.value) {
                label = titleTranslation.value;
            }
        }
        return {
            id: collection.id.split('/').pop(),
            label
        };
    });

    return { categories: mappedData, total: mappedData.length };
};

/**
 * Fetches the total number of custom collections (categories) from Shopify.
 *
 * @returns {Promise<number>} The total count of custom collections.
 */
const getTotalCategories = async () => {
    const response = await shopClient.post('/graphql.json', { query: GET_TOTAL_CATEGORIES });

    return response.data?.data?.collectionsCount?.count ?? 0;
};

/**
 * Retrieves a specific page of categories using cursor-based pagination.
 *
 * @param {string} lang - The language for the category data.
 * @param {number} targetPage - The page number to retrieve.
 * @param {string} [keyword=''] - Optional keyword to filter categories.
 * @returns {Promise<{ categoryData: any, afterCursor: string|null, actualPage: number, hasNextPage: boolean }>}
 *   An object containing the category data for the requested page, the end cursor, the actual page retrieved, and whether there is a next page.
 */
const getPaginatedCategoryPage = async (lang, targetPage, keyword = '') => {
    let afterCursor = null;
    let categoryData = null;
    let actualPage = 0;
    let hasNextPage = false;

    const total = await getTotalCategories();

    for (let currentPage = 1; currentPage <= targetPage; currentPage++) {
        const { data } = await fetchCategories(lang, currentPage, afterCursor, keyword);
        categoryData = data;
        afterCursor = data.endCursor;
        hasNextPage = data.hasNextPage;
        actualPage = currentPage;

        if (!data.hasNextPage) break;
    }

    return { categoryData, afterCursor, actualPage, hasNextPage, total };
};

/**
 * This method fetches all categories and returns them as a flat list structure.
 * @see SwaggerUI {@link http://localhost:3000/api/#/categories/get_categories}
 *
 * @param {string} [parentId] ID of the parent category to filter categories by.
 * @param {string} [keyword] Keyword to filter the categories by.
 * @param {string} [lang] Language of the request.
 * @param {number} [page=1] Number of the page to retrieve.
 * @return Promise<{ hasNext: boolean, total: number, categories: any[], endCursor: string|null }> The category tree.
 */
const categoriesGet = async (parentId, keyword, lang, page = 1) => {
    const selfPaginate = checkIfEmpty(parentId);

    const { categoryData, afterCursor, actualPage, hasNextPage } = await getPaginatedCategoryPage(lang, page, keyword);

    let mappedData = mapCategoryData(categoryData.data, lang);

    const tree = buildCategoryTree(mappedData, selfPaginate ? parentId : undefined);
    let categories = flattenCategories(tree);

    let total = keyword ? categories.length : categoryData.total;

    if (actualPage < page) {
        return { categories: [], total, hasNext: false, endCursor: afterCursor };
    }

    return { categories, total, hasNext: hasNextPage, endCursor: afterCursor };
};

/**
 * This method fetches all categories provided via the categoryIds comma seperated string.
 * @see SwaggerUI {@link http://localhost:3000/api/#/categories/get_categories}
 *
 * @param {string[]} categoryIds Comma seperated string of categoryIds.
 * @param {string} lang Language of the request.
 */
const categoriesCategoryIdsGet = async (categoryIds, lang) => {
    return fetchCategoriesByIds(categoryIds, lang);
};

/**
 * Fetches all categories and returns them as a nested structure.
 * @see SwaggerUI {@link http://localhost:3000/api/#/categories/get_categories}
 *
 * @param {number | string} [parentId] ID of the parent category to filter categories by.
 * @param {string} [lang] Language of the request.
 * @return Promise<{ hasNext: boolean, total: number, categories: any[]}> The category tree.
 */
const categoryTreeGet = async (parentId = 'root', lang) => {
    let allCategories = [];
    let afterCursor = null;
    let hasNextPage = true;

    while (hasNextPage) {
        const { data: categoryData } = await fetchCategories(lang, 1, afterCursor);
        allCategories = allCategories.concat(categoryData.data);
        afterCursor = categoryData.endCursor;
        hasNextPage = categoryData.hasNextPage;
    }

    const mappedCategories = mapCategoryData(allCategories, lang);
    const categoryTree = buildCategoryTree(mappedCategories, parentId);
    const total = countCategories(categoryTree); // includes nested

    return { categorytree: categoryTree, total };
};

/**
 * Fetches the numeric ID of a collection (category) by its handle from Shopify using GraphQL Admin API.
 * @param {string} handle - The handle of the category.
 * @returns {Promise<string|null>} The numeric ID of the category, or null if not found.
 */
const getCategoryIdByHandle = async (handle) => {
    const variables = { handle };
    const response = await shopClient.post('/graphql.json', { query: GET_CATEGORY_BY_HANDLE, variables });
    const categoryId = response.data?.data?.collectionByHandle?.id || null;

    return categoryId ? categoryId.split('/').pop() : null;
};

/**
 * Fetches the handle of a collection (category) by its numeric ID from Shopify using GraphQL Admin API.
 * @param {string} id - The numeric ID of the category.
 * @returns {Promise<string|null>} The handle of the category, or null if not found.
 */
const getCategoryHandleById = async (id) => {
    const variables = { id: `gid://shopify/Collection/${id}` };
    const response = await shopClient.post('/graphql.json', { query: GET_CATEGORY_HANDLE_BY_ID, variables });

    return response.data?.data?.collection?.handle || null;
};

module.exports = {
    categoriesGet,
    categoriesCategoryIdsGet,
    categoryTreeGet,
    getCategoryIdByHandle,
    getCategoryHandleById
};
