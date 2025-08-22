const ContentPages = require('./ContentService');
const Categories = require('./CategoriesService');
const Products = require('./ProductsService');
const logger = require('../utils/logger');
const languageMap = require('../resources/LanguageMap.json');

const LOGGING_NAME = 'MappingService';
const { DEFAULT_LANG } = process.env;

/**
 * Returns an identifier for a given Storefront URL which is used in FirstSpirit to identify the page.
 *
 * @param {string} url The Storefront URL to look up.
 * @returns {object} The identifier for the given URL.
 */
const lookupUrlGet = async function (url) {
    let path;

    // Extract the path from absolute URL otherwise use it directly
    path = url.startsWith('http://') || url.startsWith('https://') ? new URL(url).pathname : url;

    // Mapping of shop types to types that the module expects
    const typeMap = {
        products: 'product',
        collections: 'category',
        pages: 'content'
    };

    let match = path.match(/^\/([^\/]+)\/([^\/]+)\/([^\/]+)\/?$/);
    let lang, shopType, id;

    if (match) {
        [, lang, shopType, id] = match;
    } else {
        // Fallback for urls without language prefix
        match = path.match(/^\/([^\/]+)\/([^\/]+)\/?$/);
        if (match) {
            [, shopType, id] = match;
            lang = DEFAULT_LANG;
        }
    }

    const type = typeMap[shopType] || shopType;

    switch (type) {
        case 'category':
            id = await Categories.getCategoryIdByHandle(id);
            break;
        case 'product':
            id = await Products.getProductIdByHandle(id);
            break;
        case 'content':
            id = await ContentPages.getContentIdByHandle(id);
            break;
    }

    logger.logDebug(LOGGING_NAME, `Extracted id ${id}, type ${type} and lang ${lang} from URL ${url}`);
    return { id, type, lang };
};

/**
 * Returns a Storefront URL which is build out of the given identifier properties in FirstSpirit.
 *
 * @param {string} type The element type.
 * @param {number} id The element's unique Identifier.
 * @param {string} lang The language to localize the label.
 * @returns The Storefront URL belonging to the given element.
 */
const storefrontUrlGet = async function (type, id, lang = DEFAULT_LANG) {
    let handle, url, langPrefix;

    lang = lang.toLowerCase();
    const mappedLang = languageMap[lang] || lang;

    langPrefix = lang === DEFAULT_LANG ? '' : `/${mappedLang}`;

    switch (type) {
        case 'product':
            handle = await Products.getProductHandleById(id);
            url = `${langPrefix}/products/${handle}`;
            break;
        case 'category':
            handle = await Categories.getCategoryHandleById(id);
            url = `${langPrefix}/collections/${handle}`;
            break;
        case 'content':
            handle = await ContentPages.getContentHandleById(id);
            url = `${langPrefix}/pages/${handle}`;
            break;
    }

    logger.logDebug(LOGGING_NAME, `Constructed storefront URL ${url} for type ${type}, id ${id} and lang ${lang}`);
    return { url };
};

module.exports = {
    lookupUrlGet,
    storefrontUrlGet
};
