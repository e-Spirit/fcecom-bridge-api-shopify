const { shopClient } = require('../utils/http-client');
const logger = require('../utils/logger');
const { ParameterValidationError } = require('fcecom-bridge-commons');
const {
    GET_CONTENT,
    GET_CONTENT_BY_IDS,
    GET_TOTAL_CONTENT,
    GET_CONTENT_BY_HANDLE,
    GET_CONTENT_HANDLE_BY_ID,
    GET_PAGE_TRANSLATION_DIGESTS,
    REGISTER_TRANSLATIONS,
    CREATE_CONTENT,
    UPDATE_CONTENT,
    DELETE_CONTENT
} = require('../queries/content');

const LOGGING_NAME = 'ContentService';
const pageSize = 100;

const { DEFAULT_LANG } = process.env;

/**
 * Maps content page data to a standardized format with localized labels and handles.
 *
 * @param {Array} contentData - Array of content page objects from Shopify.
 * @param {string} lang - Language for translation.
 * @returns {Array<Object>} Array of mapped content objects with id, label, and extract.
 */
const mapContentData = (contentData, lang) =>
    contentData.map((contentPage) => {
        let label = contentPage.title;
        let handle = contentPage.handle;
        if (lang && lang !== 'default' && Array.isArray(contentPage.translations)) {
            const titleTranslation = contentPage.translations.find((t) => t.key === 'title');
            if (titleTranslation && titleTranslation.value) {
                label = titleTranslation.value;
            }

            const handleTranslation = contentPage.translations.find((t) => t.key === 'handle');
            if (handleTranslation && handleTranslation.value) {
                handle = handleTranslation.value;
            }
        }
        return {
            id: contentPage.id?.split?.('/')?.pop?.() || contentPage.id,
            label,
            extract: handle ? `/${handle}` : undefined
        };
    });

/**
 * Converts a bridge page object to a Shopify page input structure.
 *
 * @param {Object} bridgePage - The bridge page object.
 * @param {string|Object} bridgePage.label - The title or localized titles.
 * @param {string|Object} [bridgePage.pageUid] - The page UID or localized handles.
 * @param {string|Object} [bridgePage.handle] - The handle or localized handles.
 * @param {boolean} [bridgePage.released] - Whether the page is published.
 * @param {string} [bridgePage.template] - The template suffix.
 * @param {string} [bridgePage.templateSuffix] - The template suffix (used if template is not present).
 * @returns {Object} Shopify page input structure.
 */
const shopifyPageFromBridge = (bridgePage) => {
    let title = bridgePage.label;
    if (typeof title === 'object' && title !== null) {
        title = title[DEFAULT_LANG] || Object.values(title)[0];
    }
    let handle = bridgePage.pageUid || bridgePage.handle;
    if (typeof handle === 'object' && handle !== null) {
        handle = handle[DEFAULT_LANG] || Object.values(handle)[0];
    }
    let isPublished = bridgePage.released !== undefined ? !!bridgePage.released : true;
    let templateSuffix = bridgePage.template || 'content';
    return {
        title,
        handle,
        isPublished,
        ...(templateSuffix && { templateSuffix })
    };
};

/**
 * Creates translation objects for a Shopify page from a bridge page structure.
 *
 * @param {Object} bridgePage - The bridge page object containing localized labels and paths.
 * @param {string|null} titleDigest - The digest for the title translation content.
 * @param {string|null} handleDigest - The digest for the handle translation content.
 * @returns {Array<Object>} Array of translation objects for Shopify.
 */
const createTranslations = (bridgePage, titleDigest, handleDigest) => {
    const titleTranslations =
        titleDigest && bridgePage.label && typeof bridgePage.label === 'object'
            ? Object.entries(bridgePage.label)
                  .filter(([locale]) => locale !== DEFAULT_LANG)
                  .map(([locale, value]) => ({
                      locale,
                      key: 'title',
                      value,
                      translatableContentDigest: titleDigest
                  }))
            : [];

    let handleTranslations = [];
    if (handleDigest && bridgePage.path && typeof bridgePage.path === 'object') {
        handleTranslations = Object.entries(bridgePage.path)
            .filter(([locale]) => locale !== DEFAULT_LANG)
            .map(([locale, value]) => ({
                locale,
                key: 'handle',
                value,
                translatableContentDigest: handleDigest
            }));
    }

    return [...titleTranslations, ...handleTranslations];
};

/**
 * Fetches a paginated list of Shopify content pages, optionally filtered by keyword.
 *
 * @param {string} lang The language for the page data.
 * @param {number} [first=pageSize] Number of pages to fetch per request.
 * @param {string|null} [after=null] Cursor for pagination.
 * @param {string} [keyword=''] Optional keyword to filter pages by title.
 * @returns {Promise<{ data: { data: any[], total: number, endCursor: string|null, hasNextPage: boolean } }>}
 *   An object containing the pages, total count, pagination cursor, and next page flag.
 */
const fetchContentPages = async (lang, first = pageSize, after = null, keyword = '') => {
    const variables = {
        first,
        ...(after ? { after } : {}),
        locale: lang || DEFAULT_LANG,
        ...(keyword ? { query: `title:*${keyword}*` } : {})
    };

    logger.logDebug(
        LOGGING_NAME,
        `Performing GET request to /pages with body ${JSON.stringify(
            {
                query: GET_CONTENT,
                variables
            },
            null,
            2
        )}`
    );

    const response = await shopClient.post('/graphql.json', { query: GET_CONTENT, variables });

    const edges = response.data.data?.pages?.edges || [];
    const pages = edges.map(({ node }) => node);

    const total = await getTotalContentPages();

    const endCursor = response.data.data?.pages?.pageInfo?.endCursor || null;
    const hasNextPage = response.data.data?.pages?.pageInfo?.hasNextPage || false;

    return { data: { data: pages, total, endCursor, hasNextPage } };
};

/**
 * Fetches Shopify content pages by their IDs.
 *
 * @param {string[]} contentIds Array of content page IDs.
 * @param {string} lang Language for the page data.
 * @returns {Promise<{content: Promise<number>, total: *}>} Object containing the mapped content pages and their total count.
 */
const fetchContentPagesByIds = async (contentIds, lang) => {
    if (!contentIds || !contentIds.length) return { content: [], total: 0 };

    const variables = {
        ids: contentIds.map((id) => `gid://shopify/Page/${id}`),
        locale: lang || DEFAULT_LANG
    };

    const response = await shopClient.post('/graphql.json', { query: GET_CONTENT_BY_IDS, variables });
    const nodes = response.data.data?.nodes || [];
    const mappedData = mapContentData(nodes.filter(Boolean), lang);
    return { content: mappedData, total: mappedData.length };
};

/**
 * Fetches translation digests for a Shopify page resource.
 *
 * @param {string} resourceId The Shopify resource ID (e.g., gid://shopify/Page/123).
 * @returns {Promise<{ titleDigest: string|null, handleDigest: string|null }>} An object containing the digests for the title and handle translations, or null if not found.
 */
const fetchTranslationDigests = async (resourceId) => {
    const variables = { resourceId };
    const translationResponse = await shopClient.post('/graphql.json', {
        query: GET_PAGE_TRANSLATION_DIGESTS,
        variables
    });
    const content = translationResponse.data?.data?.translatableResource?.translatableContent || [];
    return {
        titleDigest: content.find((entry) => entry.key === 'title')?.digest || null,
        handleDigest: content.find((entry) => entry.key === 'handle')?.digest || null
    };
};

/**
 * Registers translations for a Shopify resource.
 *
 * @param {string} resourceId The Shopify resource ID (e.g., gid://shopify/Page/123).
 * @param {Array<Object>} translations Array of translation objects to register.
 * @returns {Promise<void>}
 */
const registerTranslations = async (resourceId, translations) => {
    if (!translations || !translations.length) return;

    const variables = { resourceId, translations };
    await shopClient.post('/graphql.json', { query: REGISTER_TRANSLATIONS, variables });
};

/**
 * Fetches the total number of Shopify content pages.
 *
 * @returns {Promise<number>} The total count of content pages.
 */
const getTotalContentPages = async () => {
    const response = await shopClient.post('/graphql.json', { query: GET_TOTAL_CONTENT });

    return response.data?.data?.pagesCount?.count ?? 0;
};

/**
 * Retrieves a specific page of content using cursor-based pagination.
 *
 * @param {string} lang The language for the content data.
 * @param {number} targetPage The page number to retrieve.
 * @param {string} [keyword=''] Optional keyword to filter content pages.
 * @returns {Promise<{ contentData: any, afterCursor: string|null, actualPage: number, hasNextPage: boolean, total: number }>}
 *   An object containing the content data for the requested page, the end cursor, the actual page retrieved, whether there is a next page, and the total count.
 */
const getPaginatedContentPage = async (lang, targetPage, keyword = '') => {
    let afterCursor = null;
    let contentData = null;
    let actualPage = 0;
    let hasNextPage = false;

    const total = await getTotalContentPages();

    for (let currentPage = 1; currentPage <= targetPage; currentPage++) {
        const result = await fetchContentPages(lang, pageSize, afterCursor, keyword);
        contentData = result.data;
        afterCursor = contentData.endCursor;
        hasNextPage = contentData.hasNextPage;
        actualPage = currentPage;
        if (!hasNextPage) break;
    }

    return { contentData, afterCursor, actualPage, hasNextPage, total };
};

/**
 * Retrieves a paginated list of Shopify content pages, optionally filtered by keyword.
 *
 * @param {string} keyword Optional keyword to filter content pages by title.
 * @param {string} lang The language for the page data.
 * @param {number} [page=1] The page number to retrieve.
 * @returns {Promise<{content: Promise<number>, total: *, hasNext: boolean, endCursor: (string|null)}>}
 *   An object containing the content pages, total count, pagination flag, and end cursor.
 */
const contentGet = async (keyword, lang, page = 1) => {
    const { contentData, afterCursor, actualPage, hasNextPage } = await getPaginatedContentPage(lang, page, keyword);

    let mappedData = mapContentData(contentData.data, lang);

    let total = keyword ? mappedData.length : contentData.total;

    if (actualPage < page) {
        return { content: [], total, hasNext: false, endCursor: afterCursor };
    }

    return { content: mappedData, total, hasNext: hasNextPage, endCursor: afterCursor };
};

/**
 * Fetches Shopify content pages by their IDs.
 *
 * @param {string[]} contentIds Array of content page IDs.
 * @param {string} lang Language for the page data.
 * @returns {Promise<{ content: any[], total: number }>} Object containing the mapped content pages and their total count.
 */
const contentContentIdsGet = async (contentIds, lang) => {
    return fetchContentPagesByIds(contentIds, lang);
};

/**
 * Creates a new Shopify content page from a bridge page structure and registers translations.
 *
 * @param {Object} bridgePage The bridge page object containing page data.
 * @returns {Promise<{ id: string }>} An object containing the numeric ID of the created page.
 * @throws {Error} If the Shopify pageCreate mutation fails.
 */
const contentPost = async (bridgePage) => {
    logger.logDebug(LOGGING_NAME, `Creating new content page with bridge structure: ${JSON.stringify(bridgePage)}`);

    const shopifyPage = shopifyPageFromBridge(bridgePage);
    const variables = { page: shopifyPage };

    const { data } = await shopClient.post('/graphql.json', { query: CREATE_CONTENT, variables });

    const page = data.data?.pageCreate?.page;

    if (!page) {
        const errors = data.data?.pageCreate?.userErrors || [];
        throw new Error('Shopify pageCreate failed: ' + JSON.stringify(errors));
    }

    const resourceId = page.id;
    const { titleDigest, handleDigest } = await fetchTranslationDigests(resourceId);
    const translations = createTranslations(bridgePage, titleDigest, handleDigest);
    await registerTranslations(resourceId, translations);

    return { id: page.id?.split('/').pop() };
};

/**
 * Updates a Shopify content page with the provided bridge page structure and registers translations.
 *
 * @param {string} contentId The numeric ID of the content page to update.
 * @param {Object} bridgePage The bridge page object containing updated page data.
 * @throws {ParameterValidationError} If the request body is missing or not an object.
 * @throws {Error} If the Shopify pageUpdate mutation fails.
 * @returns {Promise<void>}
 */
const contentContentIdPut = async (contentId, bridgePage) => {
    if (!bridgePage || typeof bridgePage !== 'object') {
        throw new ParameterValidationError('Request body is required and must be an object for updating a content page.');
    }

    logger.logDebug(LOGGING_NAME, `Updating content page ${contentId} with bridge structure: ${JSON.stringify(bridgePage)}`);

    const shopifyPage = shopifyPageFromBridge(bridgePage);

    const pageId = `gid://shopify/Page/${contentId}`;
    const variables = { id: pageId, page: shopifyPage };

    const { data } = await shopClient.post('/graphql.json', { query: UPDATE_CONTENT, variables });

    const page = data.data?.pageUpdate?.page;

    if (!page) {
        const errors = data.data?.pageUpdate?.userErrors || [];
        throw new Error('Shopify pageUpdate failed: ' + JSON.stringify(errors));
    }

    const resourceId = pageId;
    const { titleDigest, handleDigest } = await fetchTranslationDigests(resourceId);
    const translations = createTranslations(bridgePage, titleDigest, handleDigest);
    await registerTranslations(resourceId, translations);
};

/**
 * Deletes a Shopify content page by its numeric ID.
 *
 * @param {string} contentId The numeric ID of the content page to delete.
 * @throws {Error} If the Shopify pageDelete mutation fails.
 * @returns {Promise<void>}
 */
const contentContentIdDelete = async (contentId) => {
    logger.logDebug(LOGGING_NAME, `Deleting content page with id: ${contentId}`);
    const variables = { id: `gid://shopify/Page/${contentId}` };

    const { data } = await shopClient.post('/graphql.json', { query: DELETE_CONTENT, variables });

    const deletedId = data.data?.pageDelete?.deletedPageId;

    if (!deletedId) {
        const errors = data.data?.pageDelete?.userErrors || [];
        throw new Error('Shopify pageDelete failed: ' + JSON.stringify(errors));
    }
};

/**
 * Fetches the numeric ID of a Shopify content page by its handle.
 *
 * @param {string} handle - The handle of the content page.
 * @returns {Promise<string|null>} The numeric ID of the content page, or null if not found.
 */
const getContentIdByHandle = async (handle) => {
    let afterCursor = null;
    let hasNextPage = true;

    while (hasNextPage) {
        const variables = { first: pageSize, after: afterCursor };

        const response = await shopClient.post('/graphql.json', { query: GET_CONTENT_BY_HANDLE, variables });

        const edges = response.data?.data?.pages?.edges || [];
        const page = edges.find((e) => e.node?.handle === handle);

        if (page) {
            const pageId = page.node.id;
            return pageId ? pageId.split('/').pop() : null;
        }

        const pageInfo = response.data?.data?.pages?.pageInfo;
        hasNextPage = pageInfo?.hasNextPage;
        afterCursor = pageInfo?.endCursor;
    }

    return null;
};

/**
 * Fetches the handle of a Shopify content page by its numeric ID.
 *
 * @param {string} id The numeric ID of the content page.
 * @returns {Promise<string|null>} The handle of the content page, or null if not found.
 */
const getContentHandleById = async (id) => {
    const variables = { id: `gid://shopify/Page/${id}` };
    const response = await shopClient.post('/graphql.json', { query: GET_CONTENT_HANDLE_BY_ID, variables });
    return response.data?.data?.page?.handle || null;
};

module.exports = {
    contentGet,
    contentContentIdsGet,
    contentPost,
    contentContentIdPut,
    contentContentIdDelete,
    getContentIdByHandle,
    getContentHandleById
};
