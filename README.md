# FirstSpirit Connect for Commerce - Shopify

## Overview

### Connect for Commerce Bridge API

The bridge API serves as a REST interface which is able to fetch content, product and category information from any shop backend and to display them in reports in the FirstSpirit ContentCreator.

In order to connect the bridge API with a given shop backend a bridge is needed. It acts as a microservice between the shop backend and FirstSpirit. Further information about how to implement and use a bridge can be found in the official [documentation](https://docs.e-spirit.com/ecom/fsconnect-com/FirstSpirit_Connect_for_Commerce_Documentation_EN.html).

For more information about FirstSpirit or Connect for Commerce please use [this contact form](https://www.e-spirit.com/en/contact-us/) to get in touch.

### Shopify

This project implements the bridge API to connect FirstSpirit and the Shopify e-commerce platform.

For more information about Shopify visit [the Shopify website](https://www.shopify.com/).
Lean more about their API [here](https://shopify.dev/docs/api/admin-rest/).


## Prerequisites
- Server running node 20 or later
- Shopify store
- Access to use the Shopify Admin API

## Getting Started

### Configuration
The configuration is done by copying the `.env.template` file in the root directory to a `.env` file and editing it.

| Param                | Description                                                                                                                                                          |
|----------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| PORT                 | The port on which the bridge is started.                                                                                                                             |
| LOG_LEVEL            | The log level to be used within the Logger and the commons (for possible log levels see [link](https://github.com/e-Spirit/fcecom-bridge-commons/blob/main/README.md)) |
| CONN_MODE            | Either HTTP or HTTPS.                                                                                                                                                |
| SSL_CERT             | Path to the certificate file to use when using HTTPS.                                                                                                                |
| SSL_KEY              | Path to the private key file to use when using HTTPS.                                                                                                                |
| SHOPIFY_BASE_URL     | The base URL to connect to the Shopify store.                                                                                                                        |
| API_VERSION          | The API version to use for the Shopify GraphQL API.                                                                                                                  |
| ACCESS_TOKEN         | The access token to authenticate to Shopify.                                                                                                                         |
| DEFAULT_LANG         | The default language to use.                                                                                                                                         |
| BRIDGE_AUTH_USERNAME | The username used to identify to the Bridge (Basic Auth).                                                                                                            |
| BRIDGE_AUTH_PASSWORD | The password used to identify to the Bridge (Basic Auth).                                                                                                            |


### Language Mapping

For mapping FirstSpirit languages to Shopify storefront locales, this bridge uses a simple .json file found at `src/resources/LanguageMap.json`.
To add to this map, simply use the FirstSpirit language abbreviations as keys and the Shopify locale identifiers as values.

### Run bridge
Before starting the bridge for the first time, you have to install its dependencies:
```
npm ci
```

To start the bridge run:

```
npm start
```

### Run bridge in development mode
To start the bridge and re-start it whenever a file changed:
```
npm run start:watch
```

### View the Swagger UI interface

Open http://localhost:3000/docs in your browser to display the bridge's interactive API documentation.

### Known limitations

#### Category tree
Shopify's data model does not provide hierarchical (nested) categories.
Instead, the platform organizes products using a single-level structure called “collections,” which represent flat category groupings without parent-child relationships.
As a result, the category tree filter will not be displayed in the category report inside the ContentCreator.

#### Cursor-based pagination
Shopify's Admin API uses cursor-based pagination for its endpoints, which is different from the offset-based pagination expected by the Bridge API.
To bridge this gap, the Shopify Bridge iterates through pages using cursors until it reaches the requested page.
For large datasets, this may result in longer response times.
Therefore, it is recommended to implement a cursor cache to speed up the process.

#### Language-specific keyword filtering
Shopify's Admin API does not expose endpoints or query parameters for filtering pages, products, or collections by localized (language-specific) keywords.
All keyword-based filtering is executed against the resource fields in the store's default language only.
As a result, search queries using translated keywords in non-default languages will not display results.
However, API responses may include localized fields for supported languages, allowing the bridge to return translated labels in the requested language, even though the filtering itself is restricted to the default language.

### Configure FirstSpirit Module
In order to enable the Connect for Commerce FirstSpirit Module to communicate with the bridge, you have to configure it. Please refer to [the documentation](https://docs.e-spirit.com/ecom/fsconnect-com/FirstSpirit_Connect_for_Commerce_Documentation_EN.html#install_pcomp) to learn how to achieve this.

### Multi-Tenant Support
We provide an example `Dockerfile` and `docker-compose.yml` to enable multi-tenant support for this service.

Build and tag the Docker image with a custom name and version:
```docker
docker build -t <IMAGE_NAME>:<VERSION> .
```

The `docker-compose.yml` demonstrates how to define multiple instances of the bridge with a different configuration.

Replace `<IMAGE_NAME>:<VERSION>` with the name and tag that you chose for your Docker image.
Each configuration for an instance is set with a different `.env.*` file. The path to it needs to be defined under `env_file`.

Start the containers:
```docker
docker compose up -d
```

Stop the containers:
```docker
docker compose down
```

Please be aware that the Docker containers need to be accessible from your FirstSpirit instance in order to work with the Connect for Commerce module. A deployment to a Cloud provider might be necessary for this.

## Legal Notices
The FirstSpirit Connect for Commerce Shopify bridge is a product of [Crownpeak Technology GmbH](https://www.crownpeak.com), Dortmund, Germany. The FirstSpirit Connect for Commerce Shopify bridge is subject to the Apache-2.0 license.

Details regarding any third-party software products in use but not created by Crownpeak Technology GmbH, as well as the third-party licenses and, if applicable, update information can be found in the file THIRD-PARTY.txt.

## Disclaimer
This document is provided for information purposes only. Crownpeak may change the contents hereof without notice. This document is not warranted to be error-free, nor subject to any other warranties or conditions, whether expressed orally or implied in law, including implied warranties and conditions of merchantability or fitness for a particular purpose. Crownpeak specifically disclaims any liability with respect to this document and no contractual obligations are formed either directly or indirectly by this document. The technologies, functionality, services, and processes described herein are subject to change without notice.