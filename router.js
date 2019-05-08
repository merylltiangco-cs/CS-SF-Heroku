const express = require('express')
const router = express.Router();
const { getProducts, getProduct } = require('./Controllers/productController');
const { catchErrors } = require('./helpers/errorHandlers');

//router.get('/', catchErrors(getProducts));
router.get('/', function (req, res) {
    res.render('index');
  })
router.get('/products', catchErrors(getProducts));
router.get('/product/:productId', catchErrors(getProduct));

module.exports = router;