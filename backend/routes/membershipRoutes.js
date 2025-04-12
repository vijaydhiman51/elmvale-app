const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/membershipController");
const { verifyToken, requireAdmin } = require("../middleware/auth");

router.post("/submit", ctrl.submit);
router.get(
  "/getUnregisteredMembers",
  verifyToken,
  requireAdmin,
  ctrl.getUnregisteredMembers
);

module.exports = router;
