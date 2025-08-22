const PRODUCT_FIELDS = `
    id
    title
    handle
    description
    images(first: 1) {
        edges { node { src } }
    }
    translations(locale: $locale) {
        key
        value
        locale
    }
`;

const GET_PRODUCTS = `
    query getProducts($first: Int!, $after: String, $locale: String!, $query: String) {
        products(first: $first, after: $after, query: $query) {
            edges {
                cursor
                node {
                    ${PRODUCT_FIELDS}
                }
            }
            pageInfo {
                hasNextPage
                endCursor
            }
        }
    }
`;

const GET_PRODUCTS_BY_IDS = `
    query getProductsByIds($ids: [ID!]!, $locale: String!) {
        nodes(ids: $ids) {
            ... on Product {
                ${PRODUCT_FIELDS}
            }
        }
    }
`;

const GET_TOTAL_PRODUCTS = `
    query ProductsCount {
        productsCount {
            count
        }
    }
`;

const GET_PRODUCT_BY_HANDLE = `
    query getProductByHandle($handle: String!) {
        productByHandle(handle: $handle) {
            id
        }
    }
`;

const GET_PRODUCT_HANDLE_BY_ID = `
    query getProductById($id: ID!) {
        node(id: $id) {
            ... on Product {
                handle
            }
        }
    }
`;

module.exports = {
    PRODUCT_FIELDS,
    GET_PRODUCTS,
    GET_PRODUCTS_BY_IDS,
    GET_TOTAL_PRODUCTS,
    GET_PRODUCT_BY_HANDLE,
    GET_PRODUCT_HANDLE_BY_ID
};
