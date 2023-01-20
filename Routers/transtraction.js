const express = require('express');
const {put_orders, get_orders, get_order_items, get_orders_for_sellers} = require("../Controllers/orders");
const router = express.Router();

router.post("/neworder", put_orders);

router.get("/getmyorder", get_orders);

router.get("/getorderitems", get_order_items);

router.get("/getorderseller", get_orders_for_sellers);

module.exports = router;