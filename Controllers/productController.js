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
    request.get(shopRequestUrl + `/product_search?count=200&refine=cgid=contentserv-default-category&expand=images,prices&client_id=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`, { headers })
        .then((productsResponse) => {
            const products = JSON.parse(productsResponse);
            const filtered = products.hits.filter(product => product.hit_type=="master");
            console.log('PRODUCT LIST');
            //res.send(products);
            res.render('products', { products:filtered });
    });

};

exports.getProduct = async (req, res, next) => {
    const productId = req.params.productId;
    if ( typeof productId !== 'undefined' && productId ){
        const requestHeader = {
            'Authorization': 'Bearer ' + req.session.accessToken,
            'Content-Type': 'application/json' 
        };
        console.log(`GET PRODUCT: ${productId}`);
        request.get(shopRequestUrl + `/products/${productId}?expand=images,prices,variations,options&all_images=true&client_id=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`, { headers: requestHeader })
            .then((productResponse) => {
                const parse = JSON.parse(productResponse);
                const imageGroup = parse.image_groups.filter(group => group.view_type=="large");
                const productImages = imageGroup.shift();
                const productVariants = getVariants(parse.variants, imageGroup, req.session.accessToken);
                const product = {
                    id: parse.id,
                    name: parse.name,
                    master: parse.master['_type']==='master' ? true : false,
                    brand: parse.brand,
                    price: parse.price,
                    short_desc: parse.short_description.replace(/<[^>]+>/g, ''),
                    long_desc: parse.long_description.replace(/<[^>]+>/g, ''),
                    images: productImages.images,
                    variants: productVariants
                };
                res.json(product);
                //res.render('product', { product, title: product.name });
        });
    }
};

getVariants = (variantData, imageGroup, token) => {
    let variants = imageGroup.map(({images, variation_attributes}) => {
        const item = {
            variation_attribute : variation_attributes[0].values[0].value,
            image: {
                link: images[0].link,
                title: variation_attributes[0].values[0].value
            },
            options: []
        };
        return item;
    });
    
    variants = variants.map( variant =>{
        variantData.map(({product_id, variation_values}) => {
            const options = getProductOptions(product_id, token);
            if(variation_values){
                if(variant.variation_attribute === variation_values[Object.keys(variation_values)[0]]){
                    const option = {
                        product_id,
                        size: options.size,
                        material: options.material
                    };
                    variant.options.push(option);
                }
            }
        });
        return variant;
    });
    return variants;
};

getProductOptions = (productId, token) =>{
    try{
        const requestHeader = {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json' 
        };
        console.log(`GET Variant: ${productId}`);
        const option = request.get(shopRequestUrl + `/products/${productId}?client_id=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`, { headers: requestHeader })
            .then((productResponse) => {
                const parse = JSON.parse(productResponse);
                const attrib =  {
                    size: parse.c_size,
                    material: parse.c_material
                };
                return attrib;
            });
        console.log(option);
        return option;
    }catch(error){
        console.log(error);
    }
};