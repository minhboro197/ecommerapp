const express = require('express');
const { general_search, filter_products, get_allproducts } = require('../Controllers/products');
const router = express.Router();

router.get("/search/:pagesize/:pagenum", general_search);

router.get("/filtersearch/:pagesize/:pagenum", filter_products);

router.get("/getall/:pagesize/:pagenum", get_allproducts);
module.exports = router