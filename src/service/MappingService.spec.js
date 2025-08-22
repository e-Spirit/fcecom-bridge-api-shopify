const service = require('./MappingService');
const productsData = require('./ProductsService.spec.data');
const ProductsService = require('./ProductsService');
const categoriesData = require('./CategoriesService.spec.data');
const CategoriesService = require('./CategoriesService');
const contentPagesData = require('./ContentService.spec.data');
const ContentPagesService = require('./ContentService');

jest.mock('../../src/service/ProductsService');
jest.mock('../../src/service/CategoriesService');
jest.mock('../../src/service/ContentService');

jest.mock(
    '../resources/LanguageMap.json',
    () => ({
        en: 'en-gb',
        de: 'de-de'
    }),
    { virtual: true }
);

describe('MappingService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('storefrontUrlGet', () => {
        it('returns the storefront url for a product', async () => {
            const type = 'product';
            const id = productsData.fetchProducts.products[0].id;
            const lang = 'EN';
            const handle = 'test-product-handle';

            ProductsService.getProductHandleById.mockResolvedValue(handle);

            const result = await service.storefrontUrlGet(type, id, lang);

            expect(result).toEqual({ url: '/products/test-product-handle' });
            expect(ProductsService.getProductHandleById).toHaveBeenCalledWith(id);
        });

        it('returns the storefront url for a category', async () => {
            const type = 'category';
            const id = categoriesData.categoriesGet.categories[0].id;
            const lang = 'EN';
            const handle = 'test-category-handle';

            CategoriesService.getCategoryHandleById.mockResolvedValue(handle);

            const result = await service.storefrontUrlGet(type, id, lang);

            expect(result).toEqual({ url: '/collections/test-category-handle' });
            expect(CategoriesService.getCategoryHandleById).toHaveBeenCalledWith(id);
        });

        it('returns the storefront url for a content page', async () => {
            const type = 'content';
            const id = contentPagesData.contentGetResult.content[0].id;
            const lang = 'EN';
            const handle = 'test-page-handle';
            ContentPagesService.getContentHandleById.mockResolvedValue(handle);

            const result = await service.storefrontUrlGet(type, id, lang);

            expect(result).toEqual({ url: '/pages/test-page-handle' });
            expect(ContentPagesService.getContentHandleById).toHaveBeenCalledWith(id);
        });

        it('includes language prefix for non-default languages', async () => {
            const type = 'product';
            const id = productsData.fetchProducts.products[0].id;
            const lang = 'de';
            const handle = 'test-product-handle';
            ProductsService.getProductHandleById.mockResolvedValue(handle);

            const result = await service.storefrontUrlGet(type, id, lang);

            expect(result).toEqual({ url: '/de-de/products/test-product-handle' });
        });
    });

    describe('lookupUrlGet', () => {
        it('returns the identifier for a storefront URL for products', async () => {
            const productId = '123';
            const handle = 'test-product';
            const url = `/products/${handle}`;
            ProductsService.getProductIdByHandle.mockResolvedValue(productId);

            const result = await service.lookupUrlGet(url);

            expect(result).toEqual({
                type: 'product',
                id: productId,
                lang: process.env.DEFAULT_LANG
            });
            expect(ProductsService.getProductIdByHandle).toHaveBeenCalledWith(handle);
        });

        it('returns the identifier for a storefront URL for categories', async () => {
            const categoryId = '456';
            const handle = 'test-category';
            const url = `/collections/${handle}`;
            CategoriesService.getCategoryIdByHandle.mockResolvedValue(categoryId);

            const result = await service.lookupUrlGet(url);

            expect(result).toEqual({
                type: 'category',
                id: categoryId,
                lang: process.env.DEFAULT_LANG
            });
            expect(CategoriesService.getCategoryIdByHandle).toHaveBeenCalledWith(handle);
        });

        it('returns the identifier for a storefront URL for content pages', async () => {
            const contentId = '789';
            const handle = 'test-page';
            const url = `/pages/${handle}`;
            ContentPagesService.getContentIdByHandle.mockResolvedValue(contentId);

            const result = await service.lookupUrlGet(url);

            expect(result).toEqual({
                type: 'content',
                id: contentId,
                lang: process.env.DEFAULT_LANG
            });
            expect(ContentPagesService.getContentIdByHandle).toHaveBeenCalledWith(handle);
        });

        it('handles URLs with language prefix', async () => {
            const productId = '123';
            const handle = 'test-product';
            const url = `/de/products/${handle}`;
            ProductsService.getProductIdByHandle.mockResolvedValue(productId);

            const result = await service.lookupUrlGet(url);

            expect(result).toEqual({
                type: 'product',
                id: productId,
                lang: 'de'
            });
        });

        it('handles absolute URLs', async () => {
            const productId = '123';
            const handle = 'test-product';
            const url = `https://myshop.shopify.com/products/${handle}`;
            ProductsService.getProductIdByHandle.mockResolvedValue(productId);

            const result = await service.lookupUrlGet(url);

            expect(result).toEqual({
                type: 'product',
                id: productId,
                lang: process.env.DEFAULT_LANG
            });
        });
    });
});
