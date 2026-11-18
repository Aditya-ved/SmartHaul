
const mongoose = require("mongoose");
const Vehicle = require("../models/Vehicle");

const getVehiclesByVerificationStatus = async (req, res) => {
    try {
        const { status } = req.params;

        if (!["pending", "verified", "rejected"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid verification status"
            });
        }

        const vehicles = await Vehicle.find({
            verificationStatus: status
        })
            .populate("ownerId", "fullName email phone")
            .populate("assignedDriver", "fullName phone")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: vehicles.length,
            vehicles
        });
    } catch (error) {
        console.error("Fetch vehicles error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch vehicles"
        });
    }
};

const getPendingVehicles = async (req, res) => {
    req.params.status = "pending";
    return getVehiclesByVerificationStatus(req, res);
};

const updateVehicleVerification = async (req, res) => {
    try {
        const { id } = req.params;
        const { verificationStatus } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid vehicle ID"
            });
        }

        if (!["verified", "rejected"].includes(verificationStatus)) {
            return res.status(400).json({
                success: false,
                message: "Verification status must be verified or rejected"
            });
        }

        const vehicle = await Vehicle.findById(id);

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found"
            });
        }

        if (vehicle.verificationStatus !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Only pending vehicles can be reviewed"
            });
        }

        vehicle.verificationStatus = verificationStatus;
        await vehicle.save();

        return res.status(200).json({
            success: true,
            message: `Vehicle ${verificationStatus} successfully`,
            vehicle
        });
    } catch (error) {
        console.error("Vehicle verification error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update vehicle verification"
        });
    }
};

module.exports = {
    getPendingVehicles,
    getVehiclesByVerificationStatus,
    updateVehicleVerification
};
