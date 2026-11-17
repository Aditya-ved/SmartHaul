
const express = require("express");
const router = express.Router();

const { bookTruck } = require("../controllers/bookingController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/:shipmentId/:vehicleId", bookTruck);

module.exports = router;
