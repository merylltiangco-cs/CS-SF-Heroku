const request = require('request-promise');
const baseUrl = process.env.BASE_URL;
const dataEndpoint = process.env.DATA_ENDPOINT;
const shopEndpoint = process.env.SHOP_ENDPOINT;
const apiVersion = process.env.API_VERSION;
const siteId = process.env.SITE_ID
const requestUrl = baseUrl + dataEndpoint + apiVersion;
const shopRequestUrl = baseUrl + '/s/' + siteId + shopEndpoint + apiVersion;
const { catchErrors } = require('../helpers/errorHandlers');

exports.getProducts = async (req, res) => {
    const headers = {
        'Authorization': 'Bearer ' + req.session.accessToken,
        'Content-Type': 'application/json' 
    };

    const json = {
        'query': {
            'text_query': { 
                'fields': ['catalog_id'], 
                'search_phrase': 'contentserv-default-catalog' 
                }
        },
        'expand': ['prices', 'images'],
        'select': '(**)'
    };

    //request.post(requestUrl + `/product_search?site_id=${siteId}`, { headers: requestHeader, json: query })
    //ORTHO-84672594563225
    //ORTHO-84672594563229
    //request.get(shopRequestUrl + `/product_search?client_id=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`, { headers, json })
    request.get(shopRequestUrl + `/product_search?refine=cgid=contentserv-default-category&expand=images,prices,variations&client_id=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`, { headers })
        .then((productsResponse) => {
            const products = productsResponse.hits;
            console.log('PRODUCT LIST');
            res.json(productsResponse);
            //res.render('products', { products });
    });

};

exports.getProduct = async (req, res, next) => {
    const productId = req.params.productId;
    console.log(productId);
    if ( typeof productId !== 'undefined' && productId ){
        const requestHeader = {
            'Authorization': 'Bearer ' + req.session.accessToken,
            'Content-Type': 'application/json' 
        };
        console.log(`GET PRODUCT: ${productId}`);
        request.get(shopRequestUrl + `/products/${productId}/prices?client_id=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`, { headers: requestHeader })
            .then((productResponse) => {
                const product = JSON.parse(productResponse);
                console.log(product);
                res.json(product);
                //res.render('product', { product, title: product.page_title['default'] });
        });
    }
};