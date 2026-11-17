
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

const updateShipmentStatus = async (req, res) => {
    const session = await mongoose.startSession();

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

        let updatedShipment;

        await session.withTransaction(async () => {
            const shipment = await Shipment.findById(id).session(session);

            if (!shipment) {
                const error = new Error("Shipment not found");
                error.statusCode = 404;
                throw error;
            }

            if (!shipment.bookedVehicleId) {
                const error = new Error(
                    "No truck is assigned to this shipment"
                );
                error.statusCode = 400;
                throw error;
            }

            const vehicle = await Vehicle.findById(
                shipment.bookedVehicleId
            ).session(session);

            if (!vehicle) {
                const error = new Error("Assigned vehicle not found");
                error.statusCode = 404;
                throw error;
            }

            const isOwner =
                ["individual_owner", "company_admin"].includes(req.user.role) &&
                String(vehicle.ownerId) === String(req.user.id);

            const isAssignedDriver =
                req.user.role === "driver" &&
                String(vehicle.assignedDriver) === String(req.user.id);

            if (!isOwner && !isAssignedDriver) {
                const error = new Error(
                    "Only the assigned truck owner or driver can update this shipment"
                );
                error.statusCode = 403;
                throw error;
            }

            const allowedTransitions = {
                booked: "in_transit",
                in_transit: "delivered"
            };

            if (allowedTransitions[shipment.status] !== nextStatus) {
                const error = new Error(
                    `Cannot change shipment from ${shipment.status} to ${nextStatus}`
                );
                error.statusCode = 400;
                throw error;
            }

            updatedShipment = await Shipment.findOneAndUpdate(
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
                    runValidators: true,
                    session
                }
            );

            if (!updatedShipment) {
                const error = new Error(
                    "Shipment status changed. Refresh and try again."
                );
                error.statusCode = 409;
                throw error;
            }

            if (nextStatus === "delivered") {
                const updatedVehicle = await Vehicle.findOneAndUpdate(
                    { _id: vehicle._id },
                    [
                        {
                            $set: {
                                availableCapacityKg: {
                                    $min: [
                                        "$capacityKg",
                                        {
                                            $add: [
                                                {
                                                    $ifNull: [
                                                        "$availableCapacityKg",
                                                        "$capacityKg"
                                                    ]
                                                },
                                                shipment.weightKg
                                            ]
                                        }
                                    ]
                                }
                            }
                        }
                    ],
                    {
                        new: true,
                        session,
                        updatePipeline: true
                    }
                );

                if (!updatedVehicle) {
                    throw new Error(
                        "Failed to restore truck capacity"
                    );
                }
            }
        });

        await updatedShipment.populate(
            "bookedVehicleId",
            "vehicleNumber vehicleType make model"
        );

        return res.status(200).json({
            success: true,
            message:
                nextStatus === "delivered"
                    ? "Shipment delivered and truck capacity restored"
                    : "Shipment status updated to in_transit",
            shipment: updatedShipment
        });

    } catch (error) {
        console.error("Shipment status update error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Failed to update shipment status"
        });
    } finally {
        await session.endSession();
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
