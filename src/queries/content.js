const CONTENT_FIELDS = `
    id
    title
    handle
    translations(locale: $locale) {
        key
        value
        locale
    }
`;

const GET_CONTENT = `
    query getPages($first: Int!, $after: String, $locale: String!, $query: String) {
        pages(first: $first, after: $after, query: $query) {
            edges {
                cursor
                node {
                    ${CONTENT_FIELDS}
                }
            }
            pageInfo {
                hasNextPage
                endCursor
            }
        }
    }
`;

const GET_CONTENT_BY_IDS = `
    query getPagesByIds($ids: [ID!]!, $locale: String!) {
        nodes(ids: $ids) {
            ... on Page {
                ${CONTENT_FIELDS}
            }
        }
    }
`;

const GET_TOTAL_CONTENT = `
    query PagesCount {
        pagesCount {
            count
        }
    }
`;

// It retrieves a paginated list of pages and extracts the id and handle.
// This is necessary because the `pageByHandle` query does not exist in the Shopify Admin API.
const GET_CONTENT_BY_HANDLE = `
    query getPages($first: Int!, $after: String) {
        pages(first: $first, after: $after) {
            edges {
                node {
                    id
                    handle
                }
            }
            pageInfo {
                hasNextPage
                endCursor
            }
        }
    }
`;

const GET_CONTENT_HANDLE_BY_ID = `
    query getPageById($id: ID!) {
        page(id: $id) {
            handle
        }
    }
`;

const GET_PAGE_TRANSLATION_DIGESTS = `
    query getPageTranslations($resourceId: ID!) {
        translatableResource(resourceId: $resourceId) {
            translatableContent {
                key
                value
                digest
                locale
            }
        }
    }
`;

const REGISTER_TRANSLATIONS = `
    mutation translationsRegister($resourceId: ID!, $translations: [TranslationInput!]!) {
        translationsRegister(resourceId: $resourceId, translations: $translations) {
            userErrors { message field }
            translations { key value }
        }
    }
`;

const CREATE_CONTENT = `
    mutation CreatePage($page: PageCreateInput!) {
        pageCreate(page: $page) {
            page { id title handle }
            userErrors { code field message }
        }
    }
`;

const UPDATE_CONTENT = `
    mutation UpdatePage($id: ID!, $page: PageUpdateInput!) {
        pageUpdate(id: $id, page: $page) {
            page { id title handle }
            userErrors { code field message }
        }
    }
`;

const DELETE_CONTENT = `
    mutation pageDelete($id: ID!) {
        pageDelete(id: $id) {
            deletedPageId
            userErrors { field message }
        }
    }
`;

module.exports = {
    CONTENT_FIELDS,
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
};
