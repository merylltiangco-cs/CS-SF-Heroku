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
        request.get(shopRequestUrl + `/products/${productId}?expand=images,prices,variations,options&all_images=true&client_id=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`, { headers: requestHeader })
            .then(async(productResponse) => {
                const parse = JSON.parse(productResponse);
                const imageGroup = parse.image_groups.filter(group => group.view_type=="swatch");
                const productImages = imageGroup.shift();
                let variants = await getVariants(parse.variants, imageGroup, req.session.accessToken);
                const product = {
                    id: parse.id,
                    name: parse.name,
                    master: parse.master['_type']==='master' ? true : false,
                    brand: parse.brand,
                    price: parse.price,
                    short_desc: parse.short_description? parse.short_description.replace(/<[^>]+>/g, '') : 'No Description',
                    long_desc: parse.long_description? parse.long_description.replace(/<[^>]+>/g, '') : 'No Description',
                    images: productImages.images,
                    variants
                };
                //res.json(product);
                res.render('product', { product, title: product.name, selectedVariant: product.variants[0] });
        });
    }
};

//Sort images,variants and options
getVariants = async (variantData, imageGroup, token) => {
    //Get image first
    let variants = imageGroup.map(({images, variation_attributes}, index) => {
        const item = {
            variation_attribute: variation_attributes[0].values[0].value,
            variation_name: '',
            image: {
                link: images[0].link,
                title: variation_attributes[0].values[0].value
            },
            options_size: [],
            options_material: [],
            selected: index==0? true : false
        };
        return item;
    });
    //Get product Options
    variants = await Promise.all(variants.map(async variant =>{
        await Promise.all(variantData.map( async({product_id, variation_values}) => {
            //Get size and material
            const options = await getProductOptions(product_id, token).then((productResponse) => {
                const parse = JSON.parse(productResponse);
                return {
                    name: parse.name,
                    size: parse.c_size,
                    material: parse.c_material
                };
            });
            //Assign values
            if(variation_values){
                if(variant.variation_attribute === variation_values[Object.keys(variation_values)[0]]){
                    const sizeDuplicate = variant.options_size.filter(obj => {return obj.value === options.size});
                    if(options.size && sizeDuplicate.length === 0){
                        const size = {value: options.size};
                        variant.options_size.push(size);
                    }
                    const materialDuplicate = variant.options_material.filter(obj => {return obj.value === options.material});
                    if(options.material && materialDuplicate.length === 0){
                        const material = {
                            value: options.material
                        };
                        variant.options_material.push(material);
                    }
                    variant.variation_name = options.name;
                }
            }
        }));
        return variant;
    }));
    return variants;
};

getProductOptions = (productId, token) =>{
    const requestHeader = {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json' 
    };
    return request.get(shopRequestUrl + `/products/${productId}?client_id=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`, { headers: requestHeader });
};