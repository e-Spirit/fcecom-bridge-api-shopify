const { shopClient } = require('../utils/http-client');
const data = require('./ProductsService.spec.data');
const service = require('./ProductsService');

jest.mock('../utils/http-client');

describe('ProductsService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('productsGet', () => {
        it('fetches product data and maps it to internal type', async () => {
            const categoryId = '123456789';
            const keyword = 'test';
            const lang = 'en';
            const page = 1;

            // Mock both calls - getTotalProducts and fetchProducts
            shopClient.post
                .mockResolvedValueOnce({ data: { data: { productsCount: { count: 150 } } } })
                .mockResolvedValueOnce({ data: data.fetchProductsResponse });

            const result = await service.productsGet(categoryId, keyword, lang, page);

            expect(shopClient.post).toHaveBeenCalledTimes(2);
            expect(result.products).toBeDefined();
            expect(result.total).toBeDefined();
            expect(result.hasNext).toBeDefined();
        });

        it('handles keyword filtering', async () => {
            const keyword = 'smartphone';
            const lang = 'en';

            // Mock the total products count call first
            shopClient.post.mockResolvedValueOnce({
                data: { data: { productsCount: { count: 10 } } }
            });
            // Mock the actual products fetch call second
            shopClient.post.mockResolvedValueOnce(data.fetchProductsResponse);

            const result = await service.productsGet(null, keyword, lang);

            expect(shopClient.post).toHaveBeenCalledTimes(2);
            expect(shopClient.post).toHaveBeenNthCalledWith(1, '/graphql.json', {
                query: expect.any(String),
                variables: expect.objectContaining({
                    first: 100,
                    query: 'title:*smartphone*'
                })
            });
            expect(shopClient.post).toHaveBeenNthCalledWith(2, '/graphql.json', {
                query: expect.stringContaining('ProductsCount')
            });
            expect(result.products).toBeDefined();
        });

        it('handles category filtering', async () => {
            const categoryId = '123456789';

            shopClient.post.mockResolvedValueOnce(data.fetchProductsResponse).mockResolvedValueOnce({
                data: {
                    data: {
                        productsCount: {
                            count: 100
                        }
                    }
                }
            });

            const result = await service.productsGet(categoryId, '', 'en', 1);

            expect(shopClient.post).toHaveBeenCalledTimes(2);
            expect(shopClient.post).toHaveBeenNthCalledWith(1, '/graphql.json', {
                query: expect.any(String),
                variables: expect.objectContaining({
                    first: 100,
                    query: 'collection_id:123456789'
                })
            });
            expect(shopClient.post).toHaveBeenNthCalledWith(2, '/graphql.json', {
                query: expect.stringContaining('ProductsCount')
            });
        });

        it('handles translations correctly', async () => {
            shopClient.post
                .mockResolvedValueOnce(data.fetchProductsResponse_DE)
                .mockResolvedValueOnce({ data: { data: { productsCount: { count: 4 } } } });

            const result = await service.productsGet(null, '', 'de', 1);

            expect(shopClient.post).toHaveBeenCalledTimes(2);
            expect(result.products).toBeDefined();
            expect(result.products.some((prod) => prod.label === 'Kabellose Bluetooth-Kopfhörer')).toBe(true);
            expect(result.products.some((prod) => prod.label === 'Intelligente Kaffeemaschine')).toBe(true);
        });
    });

    describe('productsProductIdsGet', () => {
        it('fetches product data based on provided ids', async () => {
            const productIds = ['987654321', '987654322'];
            const lang = 'en';

            shopClient.post.mockResolvedValue({
                data: {
                    data: {
                        nodes: [
                            {
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
                                translations: [{ key: 'title', value: 'Wireless Bluetooth Headphones', locale: 'en' }]
                            },
                            {
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
                                translations: [{ key: 'title', value: 'Smart Coffee Maker', locale: 'en' }]
                            }
                        ]
                    }
                }
            });

            const result = await service.productsProductIdsGet(productIds, lang);

            expect(shopClient.post).toHaveBeenCalledWith('/graphql.json', {
                query: expect.stringContaining('getProductsByIds'),
                variables: {
                    ids: ['gid://shopify/Product/987654321', 'gid://shopify/Product/987654322'],
                    locale: 'en'
                }
            });
            expect(result.products).toHaveLength(2);
            expect(result.total).toBe(2);
        });

        it('handles empty product ids array', async () => {
            const result = await service.productsProductIdsGet([], 'en');

            expect(result).toEqual({ products: [], total: 0 });
            expect(shopClient.post).not.toHaveBeenCalled();
        });

        it('handles null product ids', async () => {
            const result = await service.productsProductIdsGet(null, 'en');

            expect(result).toEqual({ products: [], total: 0 });
            expect(shopClient.post).not.toHaveBeenCalled();
        });
    });

    describe('getProductHandleById', () => {
        it('returns the correct handle for a product ID', async () => {
            const productId = '123456789';

            shopClient.post.mockResolvedValue({
                data: {
                    data: {
                        node: {
                            handle: 'amazing-t-shirt'
                        }
                    }
                }
            });

            const result = await service.getProductHandleById(productId);

            expect(shopClient.post).toHaveBeenCalledWith('/graphql.json', {
                query: expect.stringContaining('getProductById'),
                variables: { id: `gid://shopify/Product/${productId}` }
            });
            expect(result).toEqual('amazing-t-shirt');
        });

        it('returns null when product not found', async () => {
            shopClient.post.mockResolvedValue({
                data: {
                    data: {
                        node: null
                    }
                }
            });

            const result = await service.getProductHandleById('non-existent-id');

            expect(result).toBeNull();
        });
    });
});
