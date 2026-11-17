
const express = require("express");
const router = express.Router();

const {
    createDriver,
    getMyDrivers,
    deleteDriver,
    getMyWork
} = require("../controllers/driverController");

const { protect } = require("../middleware/authMiddleware");

router.use(protect);

// Driver dashboard API
router.get("/my-work", getMyWork);

// Owner driver management APIs
router.post("/", createDriver);
router.get("/", getMyDrivers);
router.delete("/:id", deleteDriver);

module.exports = router;
