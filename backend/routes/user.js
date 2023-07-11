const express = require("express");
const router = express.Router();

const userCtrl = require("../controllers/user");

router.post("/api/auth/signup", userCtrl.signup); // User inscription
router.post("api/auth/login", userCtrl.login); // User connection

module.exports = router;