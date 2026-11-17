import "./FleetManagement.css";
import { useEffect, useState } from "react";
import {
    Truck,
    RefreshCw,
    Plus,
    X,
    Pencil,
    Users,
    Phone,
    UserRoundCheck
} from "lucide-react";
import api from "../services/api";

const initialFormData = {
    vehicleNumber: "",
    vehicleType: "mini_truck",
    make: "",
    model: "",
    manufacturingYear: "",
    capacityKg: "",
    availableCapacityKg: "",
    currentCity: "",
    destinationCity: "",
    registrationExpiry: "",
    insuranceExpiry: "",
    description: ""
};

function FleetManagement() {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [formData, setFormData] = useState(initialFormData);

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/vehicles");
            setVehicles(response.data.vehicles || []);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to load vehicles"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    const resetForm = () => {
        setFormData({ ...initialFormData });
        setEditingVehicle(null);
        setShowForm(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleAddVehicle = () => {
        resetForm();
        setError("");
        setSuccess("");
        setShowForm(true);
    };

    const handleEditVehicle = (vehicle) => {
        setEditingVehicle(vehicle);

        setFormData({
            vehicleNumber: vehicle.vehicleNumber || "",
            vehicleType: vehicle.vehicleType || "mini_truck",
            make: vehicle.make || "",
            model: vehicle.model || "",
            manufacturingYear: vehicle.manufacturingYear || "",
            capacityKg: vehicle.capacityKg || "",
            availableCapacityKg:
                vehicle.availableCapacityKg ?? vehicle.capacityKg ?? "",
            currentCity: vehicle.currentCity || "",
            destinationCity: vehicle.destinationCity || "",
            registrationExpiry: vehicle.registrationExpiry
                ? vehicle.registrationExpiry.substring(0, 10)
                : "",
            insuranceExpiry: vehicle.insuranceExpiry
                ? vehicle.insuranceExpiry.substring(0, 10)
                : "",
            description: vehicle.description || ""
        });

        setError("");
        setSuccess("");
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const totalCapacity = Number(formData.capacityKg);

            const availableCapacity =
                formData.availableCapacityKg === ""
                    ? totalCapacity
                    : Number(formData.availableCapacityKg);

            if (
                availableCapacity < 0 ||
                availableCapacity > totalCapacity
            ) {
                setError(
                    "Available capacity must be between 0 and total capacity."
                );
                setSaving(false);
                return;
            }

            const vehicleData = {
                ...formData,
                vehicleNumber: formData.vehicleNumber.trim().toUpperCase(),
                capacityKg: totalCapacity,
                availableCapacityKg: availableCapacity,
                currentCity: formData.currentCity.trim(),
                destinationCity: formData.destinationCity.trim()
            };

            if (formData.manufacturingYear) {
                vehicleData.manufacturingYear = Number(
                    formData.manufacturingYear
                );
            } else {
                delete vehicleData.manufacturingYear;
            }

            if (!vehicleData.registrationExpiry) {
                delete vehicleData.registrationExpiry;
            }

            if (!vehicleData.insuranceExpiry) {
                delete vehicleData.insuranceExpiry;
            }

            if (editingVehicle) {
                await api.put(
                    `/vehicles/${editingVehicle._id}`,
                    vehicleData
                );

                setSuccess("Vehicle updated successfully!");
            } else {
                await api.post("/vehicles", vehicleData);

                setSuccess("Vehicle registered successfully!");
            }

            resetForm();
            await fetchVehicles();
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to save vehicle"
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fleet-page">

            <div className="fleet-header">
                <div>
                    <h1>Fleet Management</h1>
                    <p>Manage and monitor your registered vehicles.</p>
                </div>

                <div className="fleet-header-actions">
                    <button
                        className="fleet-refresh-btn"
                        onClick={fetchVehicles}
                        disabled={loading}
                    >
                        <RefreshCw size={17} />
                        Refresh
                    </button>

                    <button
                        className="fleet-add-btn"
                        onClick={handleAddVehicle}
                    >
                        <Plus size={18} />
                        Add Vehicle
                    </button>
                </div>
            </div>

            {success && (
                <div className="fleet-success">
                    {success}
                </div>
            )}

            {error && (
                <div className="fleet-error">
                    {error}
                </div>
            )}

            <div className="fleet-stats">
                <div className="fleet-stat-card">
                    <span>Total Vehicles</span>
                    <h2>{vehicles.length}</h2>
                </div>

                <div className="fleet-stat-card">
                    <span>Available Vehicles</span>
                    <h2>
                        {vehicles.filter(
                            (vehicle) => vehicle.availability === "available"
                        ).length}
                    </h2>
                </div>

                <div className="fleet-stat-card">
                    <span>On Trip</span>
                    <h2>
                        {vehicles.filter(
                            (vehicle) => vehicle.availability === "on_trip"
                        ).length}
                    </h2>
                </div>
            </div>

            {showForm && (
                <div className="fleet-form-overlay">
                    <div className="fleet-form-container">

                        <div className="fleet-form-header">
                            <div>
                                <h2>
                                    {editingVehicle
                                        ? "Edit Vehicle"
                                        : "Register New Vehicle"}
                                </h2>
                                <p>Enter your vehicle details below.</p>
                            </div>

                            <button
                                type="button"
                                className="fleet-close-btn"
                                onClick={resetForm}
                                disabled={saving}
                            >
                                <X size={22} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="fleet-form-grid">

                                <div className="fleet-form-group">
                                    <label>Vehicle Registration Number *</label>
                                    <input
                                        type="text"
                                        name="vehicleNumber"
                                        placeholder="RJ14AB1234"
                                        value={formData.vehicleNumber}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="fleet-form-group">
                                    <label>Vehicle Type *</label>
                                    <select
                                        name="vehicleType"
                                        value={formData.vehicleType}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="mini_truck">Mini Truck</option>
                                        <option value="pickup">Pickup</option>
                                        <option value="light_truck">Light Truck</option>
                                        <option value="heavy_truck">Heavy Truck</option>
                                        <option value="container_truck">Container Truck</option>
                                        <option value="trailer">Trailer</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div className="fleet-form-group">
                                    <label>Manufacturer</label>
                                    <input
                                        type="text"
                                        name="make"
                                        placeholder="Tata"
                                        value={formData.make}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="fleet-form-group">
                                    <label>Model</label>
                                    <input
                                        type="text"
                                        name="model"
                                        placeholder="Ace Gold"
                                        value={formData.model}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="fleet-form-group">
                                    <label>Manufacturing Year</label>
                                    <input
                                        type="number"
                                        name="manufacturingYear"
                                        min="1980"
                                        max="2100"
                                        placeholder="2022"
                                        value={formData.manufacturingYear}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="fleet-form-group">
                                    <label>Total Capacity (kg) *</label>
                                    <input
                                        type="number"
                                        name="capacityKg"
                                        min="1"
                                        placeholder="10000"
                                        value={formData.capacityKg}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="fleet-form-group">
                                    <label>Available Capacity (kg) *</label>
                                    <input
                                        type="number"
                                        name="availableCapacityKg"
                                        min="0"
                                        max={formData.capacityKg || undefined}
                                        placeholder="3000"
                                        value={formData.availableCapacityKg}
                                        onChange={handleChange}
                                        required
                                    />
                                    <small>
                                        Remaining capacity available for new shipments.
                                    </small>
                                </div>

                                <div className="fleet-form-group">
                                    <label>Current City *</label>
                                    <input
                                        type="text"
                                        name="currentCity"
                                        placeholder="Ahmedabad"
                                        value={formData.currentCity}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="fleet-form-group">
                                    <label>Destination City *</label>
                                    <input
                                        type="text"
                                        name="destinationCity"
                                        placeholder="Delhi"
                                        value={formData.destinationCity}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="fleet-form-group">
                                    <label>Registration Expiry</label>
                                    <input
                                        type="date"
                                        name="registrationExpiry"
                                        value={formData.registrationExpiry}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="fleet-form-group">
                                    <label>Insurance Expiry</label>
                                    <input
                                        type="date"
                                        name="insuranceExpiry"
                                        value={formData.insuranceExpiry}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="fleet-form-group full-width">
                                    <label>Description</label>
                                    <textarea
                                        name="description"
                                        placeholder="Enter additional vehicle information..."
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="3"
                                    />
                                </div>

                            </div>

                            <div className="fleet-form-actions">
                                <button
                                    type="button"
                                    className="fleet-cancel-btn"
                                    onClick={resetForm}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="fleet-submit-btn"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingVehicle
                                            ? "Update Vehicle"
                                            : "Register Vehicle"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="fleet-vehicles-section">
                <h2>My Vehicles</h2>

                {loading ? (
                    <p>Loading vehicles...</p>
                ) : vehicles.length === 0 ? (
                    <div className="fleet-empty">
                        <Truck size={45} />
                        <h3>No vehicles registered</h3>
                        <p>Your registered vehicles will appear here.</p>
                    </div>
                ) : (
                    <div className="fleet-vehicles-grid">

                        {vehicles.map((vehicle) => {
                            const driver = vehicle.assignedDriver;

                            return (
                                <div
                                    className="fleet-vehicle-card"
                                    key={vehicle._id}
                                >
                                    <div className="fleet-vehicle-icon">
                                        <Truck size={28} />
                                    </div>

                                    <h3>{vehicle.vehicleNumber}</h3>

                                    <p>
                                        {vehicle.make || "Unknown Make"}{" "}
                                        {vehicle.model || ""}
                                    </p>

                                    <div className="fleet-vehicle-details">
                                        <span>Type</span>
                                        <strong>{vehicle.vehicleType}</strong>

                                        <span>Total Capacity</span>
                                        <strong>{vehicle.capacityKg} kg</strong>

                                        <span>Available Capacity</span>
                                        <strong>
                                            {vehicle.availableCapacityKg ??
                                                vehicle.capacityKg} kg
                                        </strong>

                                        <span>Route</span>
                                        <strong>
                                            {vehicle.currentCity || "Not set"}
                                            {" → "}
                                            {vehicle.destinationCity || "Not set"}
                                        </strong>

                                        <span>Availability</span>
                                        <strong>{vehicle.availability}</strong>

                                        <span>Verification</span>
                                        <strong>{vehicle.verificationStatus}</strong>
                                    </div>

                                    <div className="fleet-assigned-driver">
                                        <div className="fleet-driver-heading">
                                            <Users size={19} />
                                            <strong>Assigned Driver</strong>
                                        </div>

                                        {driver && typeof driver === "object" ? (
                                            <div className="fleet-driver-info">
                                                <div className="fleet-driver-avatar">
                                                    <UserRoundCheck size={22} />
                                                </div>

                                                <div>
                                                    <strong>{driver.fullName}</strong>
                                                    <span>
                                                        <Phone size={13} />
                                                        {driver.phone || "Phone not provided"}
                                                    </span>
                                                </div>

                                                <span className="fleet-driver-status">
                                                    Assigned
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="fleet-no-driver">
                                                No driver assigned
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        className="fleet-edit-btn"
                                        onClick={() => handleEditVehicle(vehicle)}
                                    >
                                        <Pencil size={16} />
                                        Edit Vehicle
                                    </button>
                                </div>
                            );
                        })}

                    </div>
                )}
            </div>
        </div>
    );
}

export default FleetManagement;
