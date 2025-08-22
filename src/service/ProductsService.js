const { shopClient } = require('../utils/http-client');
const logger = require('../utils/logger');
const {
    GET_PRODUCTS,
    GET_PRODUCTS_BY_IDS,
    GET_TOTAL_PRODUCTS,
    GET_PRODUCT_BY_HANDLE,
    GET_PRODUCT_HANDLE_BY_ID
} = require('../queries/products');

const LOGGING_NAME = 'ProductsService';
const pageSize = 100;

const { DEFAULT_LANG } = process.env;

/**
 * Maps Shopify product edges to internal product model.
 *
 * @param {Array} edges Array of product edges.
 * @param {string} lang Language for translations.
 * @returns {Array} Array of mapped product objects.
 */
const mapProductData = (edges, lang) => {
    return (edges || []).map(({ node }) => {
        const image = node.images?.edges?.[0]?.node?.src;
        let label = node.title;

        if (lang && lang !== 'default' && Array.isArray(node.translations)) {
            const titleTranslation = node.translations.find((title) => title.key === 'title');
            if (titleTranslation && titleTranslation.value) {
                label = titleTranslation.value;
            }
        }

        return {
            id: node.id.split('/').pop(),
            label,
            extract: node.description ? `${node.description}` : undefined,
            image,
            thumbnail: image
        };
    });
};

/**
 * Fetches products from Shopify using GraphQL Admin API.
 *
 * @param {string} lang Language for translations.
 * @param {number} [first=pageSize] Number of products to fetch per page.
 * @param {string|null} [after=null] Cursor for pagination.
 * @param {string} [categoryId=''] ID of the collection to filter products.
 * @param {string} [keyword=''] Keyword to filter products by title.
 * @returns {Promise<{ data: { edges: any[], total: number, endCursor: string|null, hasNextPage: boolean } }>} - Fetched product data.
 */
const fetchProducts = async (lang, first = pageSize, after = null, categoryId = '', keyword = '') => {
    let queryFilter = '';

    if (categoryId) {
        queryFilter = `collection_id:${categoryId}`;
    } else if (keyword) {
        queryFilter = `title:*${keyword}*`;
    }

    const variables = {
        first,
        ...(after ? { after } : {}),
        locale: lang || DEFAULT_LANG,
        ...(queryFilter ? { query: queryFilter } : {})
    };

    logger.logDebug(
        LOGGING_NAME,
        `Performing GET request to /products with body ${JSON.stringify(
            {
                query: GET_PRODUCTS,
                variables
            },
            null,
            2
        )}`
    );

    const response = await shopClient.post('/graphql.json', { query: GET_PRODUCTS, variables });

    const edges = response.data.data?.products?.edges || [];
    const endCursor = response.data.data?.products?.pageInfo?.endCursor || null;
    const hasNextPage = response.data.data?.products?.pageInfo?.hasNextPage || false;

    const total = await getTotalProducts();

    return { data: { edges, total, endCursor, hasNextPage } };
};

/**
 * Fetches the total number of products from Shopify using the GraphQL Admin API.
 *
 * @returns {Promise<number>} The total count of products.
 */
const getTotalProducts = async () => {
    const response = await shopClient.post('/graphql.json', { query: GET_TOTAL_PRODUCTS });
    return response.data?.data?.productsCount?.count ?? 0;
};

/**
 * Retrieves a specific page of products using cursor-based pagination.
 *
 * @param {string} lang Language for translations.
 * @param {number} targetPage The page number to retrieve.
 * @param {string} [categoryId=''] ID of the collection to filter products.
 * @param {string} [keyword=''] Keyword to filter products by title.
 * @returns {Promise<{ productData: object, afterCursor: string|null, actualPage: number, hasNextPage: boolean, total: number }>}
 */
const getPaginatedProductPage = async (lang, targetPage, categoryId = '', keyword = '') => {
    let afterCursor = null;
    let productData = null;
    let actualPage = 0;
    let hasNextPage = false;

    for (let currentPage = 1; currentPage <= targetPage; currentPage++) {
        const { data } = await fetchProducts(lang, pageSize, afterCursor, categoryId, keyword);
        productData = data;
        afterCursor = data.endCursor;
        hasNextPage = data.hasNextPage;
        actualPage = currentPage;
        if (!hasNextPage) break;
    }

    return { productData, afterCursor, actualPage, hasNextPage, total: productData.total };
};

/**
 * Fetches all products from Shopify using GraphQL Admin API and transforms them into the internal model.
 * @param {string} [categoryId] ID of the collection to get products from.
 * @param {string} [keyword] Keyword to filter the products by.
 * @param {string} [lang] Language of the request.
 * @param {number} [page=1] Number of the page to retrieve.
 * @return The fetched products.
 */
const productsGet = async (categoryId, keyword, lang, page = 1) => {
    const { productData, afterCursor, actualPage, hasNextPage, total } = await getPaginatedProductPage(lang, page, categoryId, keyword);

    let products = mapProductData(productData.edges, lang);

    if (categoryId && keyword) {
        const lowerKeyword = keyword.toLowerCase();
        products = products.filter((product) => product.label && product.label.toLowerCase().includes(lowerKeyword));
    }

    const resultTotal = keyword || categoryId ? products.length : total;

    if (actualPage < page) {
        return { products: [], total: resultTotal, hasNext: false, endCursor: afterCursor };
    }

    return { products, total: resultTotal, hasNext: hasNextPage, endCursor: afterCursor };
};

/**
 * Fetches products by IDs from Shopify using GraphQL Admin API.
 * @param {string[]} [productIds] IDs of the products to get.
 * @param {string} [lang] Language of the request.
 * @return Promise<{ products: any[], total: number }>
 */
const productsProductIdsGet = async (productIds, lang) => {
    if (!productIds || !productIds.length) return { products: [], total: 0 };

    const variables = {
        ids: productIds.map((id) => `gid://shopify/Product/${id}`),
        locale: lang || DEFAULT_LANG
    };

    const response = await shopClient.post('/graphql.json', { query: GET_PRODUCTS_BY_IDS, variables });
    const nodes = response.data.data?.nodes || [];

    const products = nodes.filter(Boolean).map((node) => {
        const image = node.images?.edges?.[0]?.node?.src;
        let label = node.title;
        if (lang && lang !== 'default' && Array.isArray(node.translations)) {
            const titleTranslation = node.translations.find((t) => t.key === 'title');
            if (titleTranslation && titleTranslation.value) {
                label = titleTranslation.value;
            }
        }
        return {
            id: node.id.split('/').pop(),
            label,
            extract: node.description ? `${node.description}` : undefined,
            image,
            thumbnail: image
        };
    });
    return { products, total: products.length };
};

/**
 * Fetches the numeric ID of a product by its handle from Shopify using GraphQL Admin API.
 * @param {string} handle Handle of the product to get.
 * @return Promise<string | null> The numeric ID of the product or null if not found.
 */
const getProductIdByHandle = async (handle) => {
    const variables = { handle };

    const response = await shopClient.post('/graphql.json', { query: GET_PRODUCT_BY_HANDLE, variables });

    const productId = response.data?.data?.productByHandle?.id || null;
    return productId ? productId.split('/').pop() : null;
};

/**
 * Fetches the handle of a Shopify product by its numeric ID.
 *
 * @param {string} id The numeric ID of the product.
 * @returns {Promise<string|null>} The handle of the product, or null if not found.
 */
const getProductHandleById = async (id) => {
    const variables = { id: `gid://shopify/Product/${id}` };

    const response = await shopClient.post('/graphql.json', { query: GET_PRODUCT_HANDLE_BY_ID, variables });

    return response.data?.data?.node?.handle || null;
};

module.exports = {
    productsGet,
    productsProductIdsGet,
    getProductIdByHandle,
    getProductHandleById
};
