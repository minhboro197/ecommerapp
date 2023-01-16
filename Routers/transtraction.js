const express = require('express');
const {put_orders, get_orders, get_order_items} = require("../Controllers/orders");
const router = express.Router();

router.post("/neworder", put_orders);

router.get("/getmyorder", get_orders);

router.get("/getorderitems", get_order_items);

module.exports = router;