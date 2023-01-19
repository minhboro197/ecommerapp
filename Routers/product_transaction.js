const express = require('express');
const {put_products, update_order_status} = require('../Controllers/seller');
const router = express.Router();

router.post('/upload', put_products);

router.post('/updateorderstatus', update_order_status);

module.exports = router