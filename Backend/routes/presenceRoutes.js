const express = require("express");
const authController = require("../controllers/authController");
const presenceController = require("../controllers/presenceController");

const router = express.Router();

router.use(authController.protect);

router.get("/", presenceController.getPresence);

module.exports = router;
