const express = require('express');
const { general_search, filter_products, get_allproducts, get_all_image_from_product, add_product_to_favorite, get_all_user_favorite, delete_favorite, get_product_by_id } = require('../Controllers/products');
const router = express.Router();

router.get("/search/:pagesize/:pagenum", general_search);

router.get("/filtersearch/:pagesize/:pagenum", filter_products);

router.get("/getall/:pagesize/:pagenum", get_allproducts);

router.get("/getimages", get_all_image_from_product);

router.post("/addfavorite", add_product_to_favorite);

router.get("/getallfavorite", get_all_user_favorite);

router.post("/deletefavorite", delete_favorite);

router.get("/getaproduct", get_product_by_id);
module.exports = router