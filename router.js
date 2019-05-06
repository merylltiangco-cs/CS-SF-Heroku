const express = require('express')
const router = express.Router();
const { getProducts, getProduct } = require('./controllers/productController');
const { catchErrors } = require('./helpers/errorHandlers');

router.get('/', catchErrors(getProducts));
router.get('/products', catchErrors(getProducts));
router.get('/product/:productId', catchErrors(getProduct));

module.exports = router;