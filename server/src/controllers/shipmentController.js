
const mongoose = require("mongoose");
const Shipment = require("../models/Shipment");
const Vehicle = require("../models/Vehicle");

const createShipment = async (req, res) => {
    try {
        const {
            pickupLocation,
            deliveryLocation,
            goodsType,
            weightKg,
            dimensions,
            description,
            pickupDate
        } = req.body;

        if (
            !pickupLocation ||
            !deliveryLocation ||
            !goodsType ||
            !weightKg ||
            !pickupDate
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required shipment details"
            });
        }

        const shipment = await Shipment.create({
            senderId: req.user.id,
            pickupLocation,
            deliveryLocation,
            goodsType,
            weightKg,
            dimensions,
            description,
            pickupDate
        });

        return res.status(201).json({
            success: true,
            message: "Shipment created successfully",
            shipment
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to create shipment"
        });
    }
};

const getMyShipments = async (req, res) => {
    try {
        const shipments = await Shipment.find({
            senderId: req.user.id
        })
            .populate("bookedVehicleId", "vehicleNumber vehicleType make model")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: shipments.length,
            shipments
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch shipments"
        });
    }
};

const getShipmentById = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid shipment ID"
            });
        }

        const shipment = await Shipment.findOne({
            _id: req.params.id,
            senderId: req.user.id
        }).populate(
            "bookedVehicleId",
            "vehicleNumber vehicleType make model"
        );

        if (!shipment) {
            return res.status(404).json({
                success: false,
                message: "Shipment not found"
            });
        }

        return res.status(200).json({
            success: true,
            shipment
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch shipment"
        });
    }
};

const updateShipment = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid shipment ID"
            });
        }

        const shipment = await Shipment.findOne({
            _id: req.params.id,
            senderId: req.user.id
        });

        if (!shipment) {
            return res.status(404).json({
                success: false,
                message: "Shipment not found"
            });
        }

        if (shipment.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Only pending shipments can be updated"
            });
        }

        const allowedFields = [
            "pickupLocation",
            "deliveryLocation",
            "goodsType",
            "weightKg",
            "dimensions",
            "description",
            "pickupDate"
        ];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                shipment[field] = req.body[field];
            }
        });

        await shipment.save();

        return res.status(200).json({
            success: true,
            message: "Shipment updated successfully",
            shipment
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to update shipment"
        });
    }
};

const cancelShipment = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid shipment ID"
            });
        }

        const shipment = await Shipment.findOne({
            _id: req.params.id,
            senderId: req.user.id
        });

        if (!shipment) {
            return res.status(404).json({
                success: false,
                message: "Shipment not found"
            });
        }

        if (shipment.status !== "pending") {
            return res.status(400).json({
                success: false,
                message: "Only pending shipments can be cancelled"
            });
        }

        shipment.status = "cancelled";
        await shipment.save();

        return res.status(200).json({
            success: true,
            message: "Shipment cancelled successfully",
            shipment
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to cancel shipment"
        });
    }
};

// Update shipment progress by the assigned truck owner
const updateShipmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status: nextStatus } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid shipment ID"
            });
        }

        if (!["in_transit", "delivered"].includes(nextStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid shipment status"
            });
        }

        const shipment = await Shipment.findById(id);

        if (!shipment) {
            return res.status(404).json({
                success: false,
                message: "Shipment not found"
            });
        }

        if (!shipment.bookedVehicleId) {
            return res.status(400).json({
                success: false,
                message: "No truck is assigned to this shipment"
            });
        }

        const vehicle = await Vehicle.findOne({
            _id: shipment.bookedVehicleId,
            ownerId: req.user.id
        });

        if (!vehicle) {
            return res.status(403).json({
                success: false,
                message: "Only the assigned truck owner can update this shipment"
            });
        }

        const allowedTransitions = {
            booked: "in_transit",
            in_transit: "delivered"
        };

        if (allowedTransitions[shipment.status] !== nextStatus) {
            return res.status(400).json({
                success: false,
                message: `Cannot change shipment from ${shipment.status} to ${nextStatus}`
            });
        }

        const updatedShipment = await Shipment.findOneAndUpdate(
            {
                _id: id,
                status: shipment.status
            },
            {
                $set: {
                    status: nextStatus
                }
            },
            {
                new: true,
                runValidators: true
            }
        ).populate(
            "bookedVehicleId",
            "vehicleNumber vehicleType make model"
        );

        if (!updatedShipment) {
            return res.status(409).json({
                success: false,
                message: "Shipment status changed. Refresh and try again."
            });
        }

        return res.status(200).json({
            success: true,
            message: `Shipment status updated to ${nextStatus}`,
            shipment: updatedShipment
        });

    } catch (error) {
        console.error("Shipment status update error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to update shipment status"
        });
    }
};

module.exports = {
    createShipment,
    getMyShipments,
    getShipmentById,
    updateShipment,
    cancelShipment,
    updateShipmentStatus
};
