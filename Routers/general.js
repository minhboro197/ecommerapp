const express = require('express');
const { general_search, filter_products } = require('../Controllers/products');
const router = express.Router();

router.get("/search/:pagesize/:pagenum", general_search);

router.get("/filtersearch/:pagesize/:pagenum", filter_products);
module.exports = router