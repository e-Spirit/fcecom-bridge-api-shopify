const { shopClient } = require('../utils/http-client');
const data = require('./CategoriesService.spec.data');
const service = require('./CategoriesService');

jest.mock('../utils/http-client');

describe('CategoriesService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('categoriesGet', () => {
        it('fetches categories and maps them to internal type', async () => {
            shopClient.post
                .mockResolvedValueOnce(data.collectionsCountResponse)
                .mockResolvedValueOnce(data.fetchCategoriesResponse)
                .mockResolvedValueOnce(data.collectionsCountResponse);

            const result = await service.categoriesGet('', '', 'en', 1);

            expect(shopClient.post).toHaveBeenCalledTimes(3);
            expect(result.categories).toBeDefined();
            expect(result.total).toBe(5);
            expect(result.hasNext).toBe(false);
        });

        it('handles keyword filtering', async () => {
            shopClient.post
                .mockResolvedValueOnce(data.collectionsCountResponse)
                .mockResolvedValueOnce(data.fetchCategoriesResponse)
                .mockResolvedValueOnce(data.collectionsCountResponse);

            const result = await service.categoriesGet('', 'Electronics', 'en', 1);

            expect(shopClient.post).toHaveBeenCalledTimes(3);
            expect(result.categories.some((cat) => cat.label === 'Electronics')).toBe(true);
        });

        it('handles translations correctly', async () => {
            shopClient.post
                .mockResolvedValueOnce(data.collectionsCountResponse)
                .mockResolvedValueOnce(data.fetchCategoriesResponse_DE)
                .mockResolvedValueOnce(data.collectionsCountResponse);

            const result = await service.categoriesGet('', '', 'de', 1);

            expect(shopClient.post).toHaveBeenCalledTimes(3);
            expect(result.categories).toBeDefined();
            expect(result.categories.some((cat) => cat.label === 'Elektronik')).toBe(true);
            expect(result.categories.some((cat) => cat.label === 'Kleidung')).toBe(true);
        });
    });

    describe('categoriesCategoryIdsGet', () => {
        it('fetches categories by IDs', async () => {
            shopClient.post.mockResolvedValueOnce({
                data: {
                    data: {
                        nodes: [
                            {
                                id: 'gid://shopify/Collection/123456789',
                                title: 'Electronics',
                                handle: 'electronics',
                                translations: []
                            },
                            {
                                id: 'gid://shopify/Collection/123456790',
                                title: 'Clothing',
                                handle: 'clothing',
                                translations: []
                            }
                        ]
                    }
                }
            });

            const result = await service.categoriesCategoryIdsGet(['123456789', '123456790'], 'en');
            expect(shopClient.post).toHaveBeenCalledTimes(1);
            expect(result.categories).toHaveLength(2);
            expect(result.total).toBe(2);
        });

        it('handles empty category ids array', async () => {
            const result = await service.categoriesCategoryIdsGet([], 'en');
            expect(result).toEqual({ categories: [], total: 0 });
            expect(shopClient.post).not.toHaveBeenCalled();
        });

        it('handles null category ids', async () => {
            const result = await service.categoriesCategoryIdsGet(null, 'en');
            expect(result).toEqual({ categories: [], total: 0 });
            expect(shopClient.post).not.toHaveBeenCalled();
        });
    });

    describe('categoryTreeGet', () => {
        it('builds a category tree', async () => {
            shopClient.post
                .mockResolvedValueOnce(data.fetchCategoriesResponse)
                .mockResolvedValueOnce(data.collectionsCountResponse)
                .mockResolvedValueOnce({
                    data: {
                        data: {
                            collections: {
                                edges: [],
                                pageInfo: { hasNextPage: false, endCursor: null }
                            }
                        }
                    }
                });

            const result = await service.categoryTreeGet();
            expect(result.categorytree).toBeDefined();
            expect(result.total).toBe(2);
            expect(result.categorytree.some((cat) => cat.label === 'Electronics')).toBe(true);
        });
    });

    describe('getCategoryIdByHandle', () => {
        it('returns the correct id for a category handle', async () => {
            shopClient.post.mockResolvedValueOnce(data.categoryByHandleResponse);

            const result = await service.getCategoryIdByHandle('electronics');
            expect(shopClient.post).toHaveBeenCalledWith('/graphql.json', expect.any(Object));
            expect(result).toEqual('123456789');
        });

        it('returns null when category not found', async () => {
            shopClient.post.mockResolvedValueOnce({
                data: { data: { collectionByHandle: null } }
            });

            const result = await service.getCategoryIdByHandle('non-existent');
            expect(result).toBeNull();
        });
    });

    describe('getCategoryHandleById', () => {
        it('returns the correct handle for a category id', async () => {
            shopClient.post.mockResolvedValueOnce(data.categoryByIdResponse);

            const result = await service.getCategoryHandleById('123456789');
            expect(shopClient.post).toHaveBeenCalledWith('/graphql.json', expect.any(Object));
            expect(result).toEqual('electronics');
        });

        it('returns null when category not found', async () => {
            shopClient.post.mockResolvedValueOnce({
                data: { data: { collection: null } }
            });

            const result = await service.getCategoryHandleById('non-existent');
            expect(result).toBeNull();
        });
    });
});
