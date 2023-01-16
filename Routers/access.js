const express = require('express');
const { refresh_token} = require('../Controllers/authorization');
const router = express.Router();

router.post("/refreshtoken", refresh_token);

module.exports = router