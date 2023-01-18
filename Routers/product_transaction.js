const express = require('express');
const {put_products} = require('../Controllers/seller');
const router = express.Router();

router.post('/upload', put_products);

module.exports = router