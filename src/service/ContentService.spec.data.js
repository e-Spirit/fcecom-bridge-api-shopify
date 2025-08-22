module.exports.contentGet = {
    content: [
        {
            id: 'gid://shopify/Page/987654321',
            title: 'About Us',
            handle: 'about-us',
            body: 'Learn more about our company and mission.',
            bodyHtml: '<p>Learn more about our company and mission.</p>',
            published: true,
            templateSuffix: null,
            translations: [
                { key: 'title', value: 'Über Uns', locale: 'de' },
                { key: 'handle', value: 'ueber-uns', locale: 'de' }
            ]
        },
        {
            id: 'gid://shopify/Page/987654322',
            title: 'Privacy Policy',
            handle: 'privacy-policy',
            body: 'Our privacy policy and data protection information.',
            bodyHtml: '<p>Our privacy policy and data protection information.</p>',
            published: true,
            templateSuffix: 'legal',
            translations: [
                { key: 'title', value: 'Datenschutz', locale: 'de' },
                { key: 'handle', value: 'datenschutz', locale: 'de' }
            ]
        },
        {
            id: 'gid://shopify/Page/987654323',
            title: 'Terms of Service',
            handle: 'terms-of-service',
            body: 'Terms and conditions for using our services.',
            bodyHtml: '<p>Terms and conditions for using our services.</p>',
            published: true,
            templateSuffix: 'legal',
            translations: [
                { key: 'title', value: 'Nutzungsbedingungen', locale: 'de' },
                { key: 'handle', value: 'nutzungsbedingungen', locale: 'de' }
            ]
        },
        {
            id: 'gid://shopify/Page/987654324',
            title: 'Contact Us',
            handle: 'contact-us',
            body: 'Get in touch with our customer service team.',
            bodyHtml: '<p>Get in touch with our customer service team.</p>',
            published: true,
            templateSuffix: null,
            translations: [
                { key: 'title', value: 'Kontakt', locale: 'de' },
                { key: 'handle', value: 'kontakt', locale: 'de' }
            ]
        },
        {
            id: 'gid://shopify/Page/987654325',
            title: 'FAQ',
            handle: 'faq',
            body: 'Frequently asked questions and answers.',
            bodyHtml: '<p>Frequently asked questions and answers.</p>',
            published: false,
            templateSuffix: null,
            translations: [
                { key: 'title', value: 'Häufige Fragen', locale: 'de' },
                { key: 'handle', value: 'haeufige-fragen', locale: 'de' }
            ]
        }
    ]
};

module.exports.fetchContentResponse = {
    data: {
        data: {
            pages: {
                edges: [
                    {
                        cursor: 'eyJsYXN0X2lkIjo5ODc2NTQzMjF9',
                        node: {
                            id: 'gid://shopify/Page/987654321',
                            title: 'About Us',
                            handle: 'about-us',
                            translations: []
                        }
                    }
                ],
                pageInfo: {
                    hasNextPage: false,
                    endCursor: 'eyJsYXN0X2lkIjo5ODc2NTQzMjF9'
                }
            }
        }
    }
};

module.exports.fetchContentResponse_DE = {
    data: {
        data: {
            pages: {
                edges: [
                    {
                        cursor: 'eyJsYXN0X2lkIjo5ODc2NTQzMjF9',
                        node: {
                            id: 'gid://shopify/Page/987654321',
                            title: 'About Us',
                            handle: 'about-us',
                            translations: [{ key: 'title', value: 'Über Uns', locale: 'de' }]
                        }
                    }
                ],
                pageInfo: {
                    hasNextPage: false,
                    endCursor: 'eyJsYXN0X2lkIjo5ODc2NTQzMjF9'
                }
            }
        }
    }
};

module.exports.contentGetResult = {
    content: [
        {
            id: '987654321',
            label: 'About Us',
            extract: '/about-us'
        },
        {
            id: '987654322',
            label: 'Privacy Policy',
            extract: '/privacy-policy'
        },
        {
            id: '987654323',
            label: 'Terms of Service',
            extract: '/terms-of-service'
        },
        {
            id: '987654324',
            label: 'Contact Us',
            extract: '/contact-us'
        },
        {
            id: '987654325',
            label: 'FAQ',
            extract: '/faq'
        }
    ],
    total: 5,
    hasNext: false,
    endCursor: null
};

module.exports.contentByIds = {
    content: [
        {
            id: '987654321',
            label: 'About Us',
            extract: '/about-us'
        },
        {
            id: '987654322',
            label: 'Privacy Policy',
            extract: '/privacy-policy'
        }
    ],
    total: 2
};

module.exports.createPageResponse = {
    data: {
        data: {
            pageCreate: {
                page: {
                    id: 'gid://shopify/Page/987654321',
                    title: 'About Us',
                    handle: 'about-us'
                },
                userErrors: []
            }
        }
    }
};
