const axios = require('axios');
const logger = require('./logger');

const LOGGING_NAME = 'http-client';

const { SHOPIFY_BASE_URL, API_VERSION, ACCESS_TOKEN } = process.env;

function responseLogger(response) {
    logger.logInfo(
        LOGGING_NAME,
        `↳ Received response ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status} ${response.statusText}`
    );
    return response;
}

function errorHandler(error) {
    const { message, response } = error;
    lastError = error;
    const data = response?.data || message;
    const status = response?.status || 500;
    if (response) {
        logger.logError(
            LOGGING_NAME,
            `↳ Received response ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status} ${
                response.statusText
            } ${message}`
        );
    } else {
        logger.logError(LOGGING_NAME, `↳ ${message}`);
    }
    return Promise.reject({ error: true, data: data?.fault?.message ?? data, status });
}

let lastError;

const shopClient = axios.create({
    baseURL: `${SHOPIFY_BASE_URL}/admin/api/${API_VERSION}`,
    headers: {
        'X-Shopify-Access-Token': ACCESS_TOKEN,
        'Content-Type': 'application/json',
        Accept: 'application/json'
    }
});
shopClient.interceptors.response.use(responseLogger, errorHandler);

module.exports = {
    shopClient
};
module.exports.getLastError = () => lastError;
