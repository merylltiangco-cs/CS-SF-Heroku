const express = require('express')
const router = express.Router();
const productController = require('./controllers/productController');
const { catchErrors } = require('./helpers/errorHandlers');

router.get('/', catchErrors(productController.getProducts));
router.get('/products', catchErrors(productController.getProducts));
router.get('/product/:productId', catchErrors(productController.getProduct));

module.exports = router;