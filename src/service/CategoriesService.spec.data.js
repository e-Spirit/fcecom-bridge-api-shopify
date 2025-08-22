module.exports.fetchCategories = {
    categories: [
        {
            id: 'gid://shopify/Collection/123456789',
            title: 'Electronics',
            handle: 'electronics',
            translations: [{ key: 'title', value: 'Elektronik', locale: 'de' }]
        },
        {
            id: 'gid://shopify/Collection/123456790',
            title: 'Clothing',
            handle: 'clothing',
            translations: [{ key: 'title', value: 'Kleidung', locale: 'de' }]
        },
        {
            id: 'gid://shopify/Collection/123456791',
            title: 'Home & Garden',
            handle: 'home-garden',
            translations: [{ key: 'title', value: 'Haus & Garten', locale: 'de' }]
        },
        {
            id: 'gid://shopify/Collection/123456792',
            title: 'Sports & Outdoors',
            handle: 'sports-outdoors',
            translations: [{ key: 'title', value: 'Sport & Outdoor', locale: 'de' }]
        },
        {
            id: 'gid://shopify/Collection/123456793',
            title: 'Health & Beauty',
            handle: 'health-beauty',
            translations: [{ key: 'title', value: 'Gesundheit & Schönheit', locale: 'de' }]
        }
    ]
};

module.exports.fetchCategoriesResponse = {
    data: {
        data: {
            collections: {
                edges: [
                    {
                        cursor: 'eyJsYXN0X2lkIjoxMjM0NTY3ODl9',
                        node: {
                            id: 'gid://shopify/Collection/123456789',
                            title: 'Electronics',
                            handle: 'electronics',
                            translations: []
                        }
                    },
                    {
                        cursor: 'eyJsYXN0X2lkIjoxMjM0NTY3OTB9',
                        node: {
                            id: 'gid://shopify/Collection/123456790',
                            title: 'Clothing',
                            handle: 'clothing',
                            translations: []
                        }
                    }
                ],
                pageInfo: {
                    hasNextPage: false,
                    endCursor: 'eyJsYXN0X2lkIjoxMjM0NTY3OTB9'
                }
            }
        }
    }
};

module.exports.fetchCategoriesResponse_DE = {
    data: {
        data: {
            collections: {
                edges: [
                    {
                        cursor: 'eyJsYXN0X2lkIjoxMjM0NTY3ODl9',
                        node: {
                            id: 'gid://shopify/Collection/123456789',
                            title: 'Electronics',
                            handle: 'electronics',
                            translations: [{ key: 'title', value: 'Elektronik', locale: 'de' }]
                        }
                    },
                    {
                        cursor: 'eyJsYXN0X2lkIjoxMjM0NTY3OTB9',
                        node: {
                            id: 'gid://shopify/Collection/123456790',
                            title: 'Clothing',
                            handle: 'clothing',
                            translations: [{ key: 'title', value: 'Kleidung', locale: 'de' }]
                        }
                    }
                ],
                pageInfo: {
                    hasNextPage: false,
                    endCursor: 'eyJsYXN0X2lkIjoxMjM0NTY3OTB9'
                }
            }
        }
    }
};

module.exports.categoriesGet = {
    categories: [
        {
            id: '123456789',
            label: 'Electronics',
            parentId: 'root'
        },
        {
            id: '123456790',
            label: 'Clothing',
            parentId: 'root'
        },
        {
            id: '123456791',
            label: 'Home & Garden',
            parentId: 'root'
        },
        {
            id: '123456792',
            label: 'Sports & Outdoors',
            parentId: 'root'
        },
        {
            id: '123456793',
            label: 'Health & Beauty',
            parentId: 'root'
        }
    ],
    total: 5,
    hasNext: false,
    endCursor: null
};

module.exports.categoriesByIds = {
    categories: [
        {
            id: '123456789',
            label: 'Electronics'
        },
        {
            id: '123456790',
            label: 'Clothing'
        }
    ],
    total: 2
};

module.exports.categoryTreeGet = {
    categorytree: [
        {
            id: '123456789',
            label: 'Electronics',
            extract: undefined
        },
        {
            id: '123456790',
            label: 'Clothing',
            extract: undefined
        },
        {
            id: '123456791',
            label: 'Home & Garden',
            extract: undefined
        },
        {
            id: '123456792',
            label: 'Sports & Outdoors',
            extract: undefined
        },
        {
            id: '123456793',
            label: 'Health & Beauty',
            extract: undefined
        }
    ],
    total: 5
};

module.exports.collectionsCountResponse = {
    data: {
        data: {
            collectionsCount: {
                count: 5
            }
        }
    }
};

module.exports.categoryByHandleResponse = {
    data: {
        data: {
            collectionByHandle: {
                id: 'gid://shopify/Collection/123456789'
            }
        }
    }
};

module.exports.categoryByIdResponse = {
    data: {
        data: {
            collection: {
                handle: 'electronics'
            }
        }
    }
};
