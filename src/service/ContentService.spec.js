const { shopClient } = require('../utils/http-client');
const data = require('./ContentService.spec.data');
const service = require('./ContentService');

jest.mock('../utils/http-client');

describe('ContentService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('contentGet', () => {
        it('fetches content and maps to internal type', async () => {
            shopClient.post
                .mockResolvedValueOnce({ data: { data: { pagesCount: { count: 5 } } } })
                .mockResolvedValueOnce(data.fetchContentResponse)
                .mockResolvedValueOnce({ data: { data: { pagesCount: { count: 5 } } } });

            const result = await service.contentGet('', 'en', 1);

            expect(shopClient.post).toHaveBeenCalledTimes(3);
            expect(result.content).toBeDefined();
            expect(result.total).toBe(5);
            expect(result.hasNext).toBe(false);
        });

        it('handles keyword filtering', async () => {
            shopClient.post
                .mockResolvedValueOnce({ data: { data: { pagesCount: { count: 5 } } } })
                .mockResolvedValueOnce(data.fetchContentResponse)
                .mockResolvedValueOnce({ data: { data: { pagesCount: { count: 5 } } } });

            const result = await service.contentGet('About', 'en', 1);

            expect(shopClient.post).toHaveBeenCalledTimes(3);
            expect(result.content.some((page) => page.label === 'About Us')).toBe(true);
        });

        it('handles translations correctly', async () => {
            shopClient.post
                .mockResolvedValueOnce({ data: { data: { pagesCount: { count: 5 } } } })
                .mockResolvedValueOnce(data.fetchContentResponse_DE)
                .mockResolvedValueOnce({ data: { data: { pagesCount: { count: 5 } } } });

            const result = await service.contentGet('', 'de', 1);

            expect(shopClient.post).toHaveBeenCalledTimes(3);
            expect(result.content).toBeDefined();
            expect(result.content[0].label).toBe('Über Uns');
        });
    });

    describe('contentContentIdsGet', () => {
        it('fetches content by IDs', async () => {
            shopClient.post.mockResolvedValueOnce({
                data: {
                    data: {
                        nodes: [
                            {
                                id: 'gid://shopify/Page/987654321',
                                title: 'About Us',
                                handle: 'about-us',
                                translations: []
                            },
                            {
                                id: 'gid://shopify/Page/987654322',
                                title: 'Privacy Policy',
                                handle: 'privacy-policy',
                                translations: []
                            }
                        ]
                    }
                }
            });

            const result = await service.contentContentIdsGet(['987654321', '987654322'], 'en');
            expect(shopClient.post).toHaveBeenCalledTimes(1);
            expect(result.content).toHaveLength(2);
            expect(result.total).toBe(2);
        });

        it('handles empty content ids array', async () => {
            const result = await service.contentContentIdsGet([], 'en');
            expect(result).toEqual({ content: [], total: 0 });
            expect(shopClient.post).not.toHaveBeenCalled();
        });

        it('handles null content ids', async () => {
            const result = await service.contentContentIdsGet(null, 'en');
            expect(result).toEqual({ content: [], total: 0 });
            expect(shopClient.post).not.toHaveBeenCalled();
        });
    });

    describe('contentPost', () => {
        it('creates a new content page and registers translations', async () => {
            shopClient.post
                .mockResolvedValueOnce(data.createPageResponse)
                .mockResolvedValueOnce({
                    data: {
                        data: {
                            translatableResource: {
                                translatableContent: [
                                    { key: 'title', digest: 'digest-title' },
                                    { key: 'handle', digest: 'digest-handle' }
                                ]
                            }
                        }
                    }
                })
                .mockResolvedValueOnce({});

            const bridgePage = {
                label: { de: 'Über uns', en: 'About us' },
                pageUid: 'about-us',
                path: { de: 'ueber-uns', en: 'about-us' },
                released: true,
                template: 'content'
            };

            const result = await service.contentPost(bridgePage);

            expect(shopClient.post).toHaveBeenCalledTimes(3);
            expect(result.id).toBe('987654321');

            const registerCall = shopClient.post.mock.calls[2][1];
            expect(registerCall.variables.translations).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ locale: 'de', key: 'title', value: 'Über uns' }),
                    expect.objectContaining({ locale: 'de', key: 'handle', value: 'ueber-uns' })
                ])
            );
        });

        it('throws if pageCreate fails', async () => {
            shopClient.post.mockResolvedValueOnce({
                data: { data: { pageCreate: { page: null, userErrors: [{ message: 'error' }] } } }
            });

            await expect(service.contentPost({ label: 'fail' })).rejects.toThrow(/Shopify pageCreate failed/);
        });
    });

    describe('contentContentIdPut', () => {
        it('updates a content page and registers translations', async () => {
            shopClient.post
                .mockResolvedValueOnce({ data: { data: { pageUpdate: { page: { id: 'gid://shopify/Page/987654321' } } } } }) // pageUpdate
                .mockResolvedValueOnce({
                    data: {
                        data: {
                            translatableResource: {
                                translatableContent: [
                                    { key: 'title', digest: 'digest-title' },
                                    { key: 'handle', digest: 'digest-handle' }
                                ]
                            }
                        }
                    }
                })
                .mockResolvedValueOnce({});

            await expect(
                service.contentContentIdPut('987654321', { label: { en: 'Updated', de: 'Aktualisiert' } })
            ).resolves.toBeUndefined();
            expect(shopClient.post).toHaveBeenCalledTimes(3);

            const registerCall = shopClient.post.mock.calls[2][1];
            expect(registerCall.variables.translations).toEqual(
                expect.arrayContaining([expect.objectContaining({ locale: 'de', key: 'title', value: 'Aktualisiert' })])
            );
        });

        it('throws if request body is missing', async () => {
            await expect(service.contentContentIdPut('987654321')).rejects.toThrow(/Request body is required/);
        });

        it('throws if pageUpdate fails', async () => {
            shopClient.post.mockResolvedValueOnce({
                data: { data: { pageUpdate: { page: null, userErrors: [{ message: 'error' }] } } }
            });

            await expect(service.contentContentIdPut('987654321', { label: 'fail' })).rejects.toThrow(/Shopify pageUpdate failed/);
        });
    });

    describe('contentContentIdDelete', () => {
        it('deletes a content page', async () => {
            shopClient.post.mockResolvedValueOnce({
                data: { data: { pageDelete: { deletedPageId: 'gid://shopify/Page/987654321' } } }
            });

            await expect(service.contentContentIdDelete('987654321')).resolves.toBeUndefined();
            expect(shopClient.post).toHaveBeenCalledTimes(1);
        });

        it('throws if pageDelete fails', async () => {
            shopClient.post.mockResolvedValueOnce({
                data: { data: { pageDelete: { deletedPageId: null, userErrors: [{ message: 'error' }] } } }
            });

            await expect(service.contentContentIdDelete('987654321')).rejects.toThrow(/Shopify pageDelete failed/);
        });
    });

    describe('getContentIdByHandle', () => {
        it('returns the correct id for a content handle', async () => {
            shopClient.post.mockResolvedValueOnce({
                data: {
                    data: {
                        pages: {
                            edges: [{ node: { id: 'gid://shopify/Page/987654321', handle: 'about-us' } }],
                            pageInfo: { hasNextPage: false, endCursor: null }
                        }
                    }
                }
            });

            const result = await service.getContentIdByHandle('about-us');
            expect(result).toEqual('987654321');
        });

        it('returns null when content not found', async () => {
            shopClient.post.mockResolvedValueOnce({
                data: {
                    data: {
                        pages: {
                            edges: [],
                            pageInfo: { hasNextPage: false, endCursor: null }
                        }
                    }
                }
            });

            const result = await service.getContentIdByHandle('non-existent');
            expect(result).toBeNull();
        });
    });

    describe('getContentHandleById', () => {
        it('returns the correct handle for a content id', async () => {
            shopClient.post.mockResolvedValueOnce({
                data: { data: { page: { handle: 'about-us' } } }
            });

            const result = await service.getContentHandleById('987654321');
            expect(result).toEqual('about-us');
        });

        it('returns null when content not found', async () => {
            shopClient.post.mockResolvedValueOnce({
                data: { data: { page: null } }
            });

            const result = await service.getContentHandleById('non-existent');
            expect(result).toBeNull();
        });
    });
});
