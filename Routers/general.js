const express = require('express');
const { general_search, filter_products, get_allproducts, get_all_image_from_product } = require('../Controllers/products');
const router = express.Router();

router.get("/search/:pagesize/:pagenum", general_search);

router.get("/filtersearch/:pagesize/:pagenum", filter_products);

router.get("/getall/:pagesize/:pagenum", get_allproducts);

router.get("/getimages", get_all_image_from_product);

module.exports = router