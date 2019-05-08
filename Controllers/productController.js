const request = require('request-promise');
const baseUrl = process.env.BASE_URL;
const dataEndpoint = process.env.DATA_ENDPOINT;
const shopEndpoint = process.env.SHOP_ENDPOINT;
const apiVersion = process.env.API_VERSION;
const siteId = process.env.SITE_ID
const requestUrl = baseUrl + dataEndpoint + apiVersion;
const { catchErrors } = require('../helpers/errorHandlers');

exports.getProducts = async (req, res) => {
    const requestHeader = {
        'Authorization': 'Bearer ' + req.session.accessToken,
        'Content-Type': 'application/json' 
    };

    const query = {
        'query': {
            'text_query': { 
                'fields': ['catalog_id'], 
                'search_phrase': 'contentserv-default-catalog' 
                }
        },
        'select': '(**)'
    };

    request.post(requestUrl + `/product_search?expand=images,prices&site_id=${siteId}`, { headers: requestHeader, json: query })
        .then((productsResponse) => {
            const products = productsResponse.hits;
            console.log('PRODUCT LIST');
            //res.json(products);
            res.render('products', { products });
    });
};

exports.getProduct = async (req, res) => {
    const productId = req.params.productId;
    if (!isNaN(productId)) {
        const requestHeader = {
            'Authorization': 'Bearer ' + req.session.accessToken,
            'Content-Type': 'application/json' 
        };
        console.log(`GET PRODUCT: ${productId}`)
        request.get(requestUrl + `/products/${productId}?expand=all&site_id=${siteId}`, { headers: requestHeader })
            .then((productResponse) => {
                const product = JSON.parse(productResponse);
                //res.json(product);
                res.render('product', { product });
        });
    }
};