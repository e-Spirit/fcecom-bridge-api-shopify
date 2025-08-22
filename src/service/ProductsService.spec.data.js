module.exports.fetchProducts = {
    products: [
        {
            id: 'gid://shopify/Product/987654321',
            title: 'Wireless Bluetooth Headphones',
            handle: 'wireless-bluetooth-headphones',
            description: 'Premium quality wireless headphones with noise cancellation',
            images: {
                edges: [
                    {
                        node: {
                            src: 'https://cdn.shopify.com/s/files/1/0001/0001/products/headphones.jpg'
                        }
                    }
                ]
            },
            translations: [{ key: 'title', value: 'Kabellose Bluetooth-Kopfhörer', locale: 'de' }]
        },
        {
            id: 'gid://shopify/Product/987654322',
            title: 'Smart Coffee Maker',
            handle: 'smart-coffee-maker',
            description: 'WiFi-enabled coffee maker with mobile app control',
            images: {
                edges: [
                    {
                        node: {
                            src: 'https://cdn.shopify.com/s/files/1/0001/0001/products/coffee-maker.jpg'
                        }
                    }
                ]
            },
            translations: [{ key: 'title', value: 'Intelligente Kaffeemaschine', locale: 'de' }]
        },
        {
            id: 'gid://shopify/Product/987654323',
            title: 'Organic Cotton T-Shirt',
            handle: 'organic-cotton-t-shirt',
            description: 'Comfortable and sustainable organic cotton t-shirt',
            images: {
                edges: [
                    {
                        node: {
                            src: 'https://cdn.shopify.com/s/files/1/0001/0001/products/tshirt.jpg'
                        }
                    }
                ]
            },
            translations: [{ key: 'title', value: 'Bio-Baumwoll-T-Shirt', locale: 'de' }]
        },
        {
            id: 'gid://shopify/Product/987654324',
            title: 'Stainless Steel Water Bottle',
            handle: 'stainless-steel-water-bottle',
            description: 'Insulated water bottle that keeps drinks cold for 24 hours',
            images: {
                edges: [
                    {
                        node: {
                            src: 'https://cdn.shopify.com/s/files/1/0001/0001/products/water-bottle.jpg'
                        }
                    }
                ]
            },
            translations: [{ key: 'title', value: 'Edelstahl-Wasserflasche', locale: 'de' }]
        }
    ]
};

module.exports.fetchProductsResponse = {
    data: {
        data: {
            products: {
                edges: [
                    {
                        cursor: 'eyJsYXN0X2lkIjo5ODc2NTQzMjF9',
                        node: {
                            id: 'gid://shopify/Product/987654321',
                            title: 'Wireless Bluetooth Headphones',
                            handle: 'wireless-bluetooth-headphones',
                            images: {
                                edges: [
                                    {
                                        node: {
                                            src: 'https://cdn.shopify.com/s/files/1/0001/0001/products/headphones.jpg'
                                        }
                                    }
                                ]
                            },
                            translations: []
                        }
                    },
                    {
                        cursor: 'eyJsYXN0X2lkIjo5ODc2NTQzMjJ9',
                        node: {
                            id: 'gid://shopify/Product/987654322',
                            title: 'Smart Coffee Maker',
                            handle: 'smart-coffee-maker',
                            images: {
                                edges: [
                                    {
                                        node: {
                                            src: 'https://cdn.shopify.com/s/files/1/0001/0001/products/coffee-maker.jpg'
                                        }
                                    }
                                ]
                            },
                            translations: []
                        }
                    }
                ],
                pageInfo: {
                    hasNextPage: false,
                    endCursor: 'eyJsYXN0X2lkIjo5ODc2NTQzMjJ9'
                }
            }
        }
    }
};

module.exports.fetchProductsResponse_DE = {
    data: {
        data: {
            products: {
                edges: [
                    {
                        cursor: 'eyJsYXN0X2lkIjo5ODc2NTQzMjF9',
                        node: {
                            id: 'gid://shopify/Product/987654321',
                            title: 'Wireless Bluetooth Headphones',
                            handle: 'wireless-bluetooth-headphones',
                            images: {
                                edges: [
                                    {
                                        node: {
                                            src: 'https://cdn.shopify.com/s/files/1/0001/0001/products/headphones.jpg'
                                        }
                                    }
                                ]
                            },
                            translations: [{ key: 'title', value: 'Kabellose Bluetooth-Kopfhörer', locale: 'de' }]
                        }
                    },
                    {
                        cursor: 'eyJsYXN0X2lkIjo5ODc2NTQzMjJ9',
                        node: {
                            id: 'gid://shopify/Product/987654322',
                            title: 'Smart Coffee Maker',
                            handle: 'smart-coffee-maker',
                            images: {
                                edges: [
                                    {
                                        node: {
                                            src: 'https://cdn.shopify.com/s/files/1/0001/0001/products/coffee-maker.jpg'
                                        }
                                    }
                                ]
                            },
                            translations: [{ key: 'title', value: 'Intelligente Kaffeemaschine', locale: 'de' }]
                        }
                    }
                ],
                pageInfo: {
                    hasNextPage: false,
                    endCursor: 'eyJsYXN0X2lkIjo5ODc2NTQzMjJ9'
                }
            }
        }
    }
};

module.exports.productsGetResult = {
    products: [
        {
            id: '987654321',
            label: 'Wireless Bluetooth Headphones',
            extract: '/Premium quality wireless headphones with noise cancellation/',
            image: 'https://cdn.shopify.com/s/files/1/0001/0001/products/headphones.jpg',
            thumbnail: 'https://cdn.shopify.com/s/files/1/0001/0001/products/headphones.jpg'
        },
        {
            id: '987654322',
            label: 'Smart Coffee Maker',
            extract: '/WiFi-enabled coffee maker with mobile app control/',
            image: 'https://cdn.shopify.com/s/files/1/0001/0001/products/coffee-maker.jpg',
            thumbnail: 'https://cdn.shopify.com/s/files/1/0001/0001/products/coffee-maker.jpg'
        },
        {
            id: '987654323',
            label: 'Organic Cotton T-Shirt',
            extract: '/Comfortable and sustainable organic cotton t-shirt/',
            image: 'https://cdn.shopify.com/s/files/1/0001/0001/products/tshirt.jpg',
            thumbnail: 'https://cdn.shopify.com/s/files/1/0001/0001/products/tshirt.jpg'
        },
        {
            id: '987654324',
            label: 'Stainless Steel Water Bottle',
            extract: '/Insulated water bottle that keeps drinks cold for 24 hours/',
            image: 'https://cdn.shopify.com/s/files/1/0001/0001/products/water-bottle.jpg',
            thumbnail: 'https://cdn.shopify.com/s/files/1/0001/0001/products/water-bottle.jpg'
        }
    ],
    total: 4,
    hasNext: false,
    endCursor: null
};

module.exports.productsByIds = {
    products: [
        {
            id: '987654321',
            label: 'Wireless Bluetooth Headphones',
            extract: 'Premium quality wireless headphones with noise cancellation',
            image: 'https://cdn.shopify.com/s/files/1/0001/0001/products/headphones.jpg',
            thumbnail: 'https://cdn.shopify.com/s/files/1/0001/0001/products/headphones.jpg'
        },
        {
            id: '987654322',
            label: 'Smart Coffee Maker',
            extract: 'WiFi-enabled coffee maker with mobile app control',
            image: 'https://cdn.shopify.com/s/files/1/0001/0001/products/coffee-maker.jpg',
            thumbnail: 'https://cdn.shopify.com/s/files/1/0001/0001/products/coffee-maker.jpg'
        }
    ],
    total: 2
};
