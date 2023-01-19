const express = require('express');

const { confirm_email, register, login, signout, get_user_infor } = require('../Controllers/authenticate');
const router = express.Router();

router.post("/confirm", confirm_email);

router.post("/register", register);

router.post("/login", login);

router.post("/signout", signout);

router.get("/getuserinfor", get_user_infor);

module.exports = router;