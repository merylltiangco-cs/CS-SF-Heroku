const request = require('request-promise');
const baseUrl = process.env.BASE_URL;
const dataEndpoint = process.env.DATA_ENDPOINT;
const shopEndpoint = process.env.SHOP_ENDPOINT;
const apiVersion = process.env.API_VERSION;
const siteId = process.env.SITE_ID
const dataRequestUrl = baseUrl + dataEndpoint + apiVersion;
const shopRequestUrl = baseUrl + '/s/' + siteId + shopEndpoint + apiVersion;
const { catchErrors } = require('../helpers/errorHandlers');

exports.getProducts = async (req, res, next) => {
    const headers = {
        'Authorization': 'Bearer ' + req.session.accessToken,
        'Content-Type': 'application/json' 
    };
    request.get(shopRequestUrl + `/product_search?refine=cgid=contentserv-default-category&expand=images,prices,variations&client_id=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`, { headers })
        .then((productsResponse) => {
            const products = JSON.parse(productsResponse);
            console.log('PRODUCT LIST');
            //res.send(products);
            res.render('products', { products:products.hits });
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
        request.get(shopRequestUrl + `/products/${productId}?expand=images,prices,variations&client_id=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`, { headers: requestHeader })
            .then((productResponse) => {
                const product = JSON.parse(productResponse);
                //res.json(product);
                res.render('product', { product, title: product.page_title['default'] });
        });
    }
};