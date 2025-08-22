const CATEGORY_FIELDS = `
    id
    title
    handle
    translations(locale: $locale) {
        key
        value
        locale
    }
`;

const GET_CATEGORIES = `
    query getCategories($first: Int!, $after: String, $locale: String!, $query: String) {
        collections(first: $first, after: $after, query: $query) {
            edges {
                cursor
                node {
                    ${CATEGORY_FIELDS}
                }
            }
            pageInfo {
                hasNextPage
                endCursor
            }
        }
    }
`;

const GET_CATEGORIES_BY_IDS = `
    query getCategoriesByIds($ids: [ID!]!, $locale: String!) {
        nodes(ids: $ids) {
            ... on Collection {
                ${CATEGORY_FIELDS}
            }
        }
    }
`;

const GET_TOTAL_CATEGORIES = `
    query CollectionsCount {
        collectionsCount(query: "collection_type:custom") {
            count
        }
    }
`;

const GET_CATEGORY_BY_HANDLE = `
    query getCollectionByHandle($handle: String!) {
        collectionByHandle(handle: $handle) {
            id
        }
    }
`;

const GET_CATEGORY_HANDLE_BY_ID = `
    query getCollectionById($id: ID!) {
        collection(id: $id) {
            handle
        }
    }
`;

module.exports = {
    CATEGORY_FIELDS,
    GET_CATEGORIES,
    GET_CATEGORIES_BY_IDS,
    GET_TOTAL_CATEGORIES,
    GET_CATEGORY_BY_HANDLE,
    GET_CATEGORY_HANDLE_BY_ID
};
