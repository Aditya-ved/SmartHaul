
import { useEffect, useState } from "react";
import {
    Package,
    Plus,
    RefreshCw,
    X,
    MapPin,
    CalendarDays,
    Weight,
    Pencil,
    Ban,
    ArrowRight,
    Truck,
    CheckCircle
} from "lucide-react";
import api from "../services/api";

const initialForm = {
    pickupAddress: "",
    pickupCity: "",
    pickupState: "",
    pickupPincode: "",
    deliveryAddress: "",
    deliveryCity: "",
    deliveryState: "",
    deliveryPincode: "",
    goodsType: "",
    weightKg: "",
    lengthCm: "",
    widthCm: "",
    heightCm: "",
    description: "",
    pickupDate: ""
};

const statusLabels = {
    pending: "Pending",
    matching: "Finding a truck",
    matched: "Matched",
    booked: "Booked",
    in_transit: "In Transit",
    delivered: "Delivered",
    cancelled: "Cancelled"
};

function ShipmentManagement() {
    const [shipments, setShipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingShipment, setEditingShipment] = useState(null);
    const [formData, setFormData] = useState(initialForm);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [matchingLoading, setMatchingLoading] = useState({});
    const [matchingResults, setMatchingResults] = useState({});
    const [matchingErrors, setMatchingErrors] = useState({});
    const [bookingLoading, setBookingLoading] = useState({});
    const [bookingErrors, setBookingErrors] = useState({});

    const fetchShipments = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/shipments");
            setShipments(response.data.shipments || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load your shipments."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShipments();
    }, []);

    const resetForm = () => {
        setFormData({ ...initialForm });
        setEditingShipment(null);
        setShowForm(false);
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const openAddForm = () => {
        resetForm();
        setError("");
        setSuccess("");
        setShowForm(true);
    };

    const openEditForm = (shipment) => {
        setEditingShipment(shipment);

        setFormData({
            pickupAddress: shipment.pickupLocation?.address || "",
            pickupCity: shipment.pickupLocation?.city || "",
            pickupState: shipment.pickupLocation?.state || "",
            pickupPincode: shipment.pickupLocation?.pincode || "",
            deliveryAddress: shipment.deliveryLocation?.address || "",
            deliveryCity: shipment.deliveryLocation?.city || "",
            deliveryState: shipment.deliveryLocation?.state || "",
            deliveryPincode: shipment.deliveryLocation?.pincode || "",
            goodsType: shipment.goodsType || "",
            weightKg: shipment.weightKg || "",
            lengthCm: shipment.dimensions?.lengthCm || "",
            widthCm: shipment.dimensions?.widthCm || "",
            heightCm: shipment.dimensions?.heightCm || "",
            description: shipment.description || "",
            pickupDate: shipment.pickupDate
                ? new Date(shipment.pickupDate).toISOString().slice(0, 10)
                : ""
        });

        setError("");
        setSuccess("");
        setShowForm(true);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const shipmentData = {
                pickupLocation: {
                    address: formData.pickupAddress.trim(),
                    city: formData.pickupCity.trim(),
                    state: formData.pickupState.trim(),
                    pincode: formData.pickupPincode.trim()
                },
                deliveryLocation: {
                    address: formData.deliveryAddress.trim(),
                    city: formData.deliveryCity.trim(),
                    state: formData.deliveryState.trim(),
                    pincode: formData.deliveryPincode.trim()
                },
                goodsType: formData.goodsType.trim(),
                weightKg: Number(formData.weightKg),
                dimensions: {
                    lengthCm: Number(formData.lengthCm) || 0,
                    widthCm: Number(formData.widthCm) || 0,
                    heightCm: Number(formData.heightCm) || 0
                },
                description: formData.description.trim(),
                pickupDate: new Date(
                    `${formData.pickupDate}T10:00:00`
                ).toISOString()
            };

            if (editingShipment) {
                await api.put(
                    `/shipments/${editingShipment._id}`,
                    shipmentData
                );
                setSuccess("Shipment updated successfully!");
            } else {
                await api.post("/shipments", shipmentData);
                setSuccess("Shipment created successfully!");
            }

            resetForm();
            await fetchShipments();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to save shipment."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleCancelShipment = async (shipmentId) => {
        const confirmed = window.confirm(
            "Are you sure you want to cancel this shipment?"
        );

        if (!confirmed) return;

        try {
            setError("");
            setSuccess("");

            await api.delete(`/shipments/${shipmentId}`);

            setSuccess("Shipment cancelled successfully!");
            await fetchShipments();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to cancel shipment."
            );
        }
    };

    const handleFindMatches = async (shipmentId) => {
        try {
            setMatchingLoading((previous) => ({
                ...previous,
                [shipmentId]: true
            }));

            setMatchingErrors((previous) => ({
                ...previous,
                [shipmentId]: ""
            }));

            setMatchingResults((previous) => {
                const updated = { ...previous };
                delete updated[shipmentId];
                return updated;
            });

            const response = await api.get(`/matching/${shipmentId}`);

            setMatchingResults((previous) => ({
                ...previous,
                [shipmentId]: response.data.matches || []
            }));

        } catch (err) {
            setMatchingErrors((previous) => ({
                ...previous,
                [shipmentId]:
                    err.response?.data?.message ||
                    "Unable to find matching trucks."
            }));
        } finally {
            setMatchingLoading((previous) => ({
                ...previous,
                [shipmentId]: false
            }));
        }
    };

    const handleBookTruck = async (shipmentId, vehicleId) => {
        const confirmed = window.confirm(
            "Are you sure you want to book this truck for your shipment?"
        );

        if (!confirmed) return;

        try {
            setBookingLoading((previous) => ({
                ...previous,
                [shipmentId]: vehicleId
            }));

            setBookingErrors((previous) => ({
                ...previous,
                [shipmentId]: ""
            }));

            setError("");
            setSuccess("");

            const response = await api.post(
                `/bookings/${shipmentId}/${vehicleId}`
            );

            setSuccess(
                response.data.message || "Truck booked successfully!"
            );

            setMatchingResults((previous) => {
                const updated = { ...previous };
                delete updated[shipmentId];
                return updated;
            });

            await fetchShipments();

        } catch (err) {
            setBookingErrors((previous) => ({
                ...previous,
                [shipmentId]:
                    err.response?.data?.message ||
                    "Unable to book this truck."
            }));
        } finally {
            setBookingLoading((previous) => ({
                ...previous,
                [shipmentId]: null
            }));
        }
    };

    const formatDate = (date) => {
        if (!date) return "Not specified";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    };

    const getStatusClass = (status) => {
        return `shipment-status status-${status}`;
    };

    const pendingCount = shipments.filter(
        (shipment) => shipment.status === "pending"
    ).length;

    const activeCount = shipments.filter(
        (shipment) =>
            ["matching", "matched", "booked", "in_transit"].includes(
                shipment.status
            )
    ).length;

    const completedCount = shipments.filter(
        (shipment) => shipment.status === "delivered"
    ).length;

    return (
        <div className="shipment-page">

            <header className="shipment-header">
                <div>
                    <span className="shipment-eyebrow">
                        SMART FREIGHT MANAGEMENT
                    </span>
                    <h1>Shipment Management</h1>
                    <p>Create and manage your goods transportation requests.</p>
                </div>

                <div className="shipment-header-actions">
                    <button
                        className="shipment-refresh-btn"
                        onClick={fetchShipments}
                        disabled={loading}
                    >
                        <RefreshCw size={17} />
                        Refresh
                    </button>

                    <button
                        className="shipment-add-btn"
                        onClick={openAddForm}
                    >
                        <Plus size={18} />
                        Create Shipment
                    </button>
                </div>
            </header>

            {success && (
                <div className="shipment-alert shipment-alert-success">
                    {success}
                </div>
            )}

            {error && (
                <div className="shipment-alert shipment-alert-error">
                    {error}
                </div>
            )}

            <section className="shipment-stats">
                <article>
                    <div className="shipment-stat-icon">
                        <Package size={22} />
                    </div>
                    <div>
                        <span>Total Shipments</span>
                        <strong>{shipments.length}</strong>
                    </div>
                </article>

                <article>
                    <div className="shipment-stat-icon pending">
                        <CalendarDays size={22} />
                    </div>
                    <div>
                        <span>Pending</span>
                        <strong>{pendingCount}</strong>
                    </div>
                </article>

                <article>
                    <div className="shipment-stat-icon active">
                        <Truck size={22} />
                    </div>
                    <div>
                        <span>Active Shipments</span>
                        <strong>{activeCount}</strong>
                    </div>
                </article>

                <article>
                    <div className="shipment-stat-icon completed">
                        <MapPin size={22} />
                    </div>
                    <div>
                        <span>Delivered</span>
                        <strong>{completedCount}</strong>
                    </div>
                </article>
            </section>

            {showForm && (
                <div className="shipment-modal-overlay">
                    <div className="shipment-modal">

                        <div className="shipment-modal-header">
                            <div>
                                <h2>
                                    {editingShipment
                                        ? "Edit Shipment"
                                        : "Create New Shipment"}
                                </h2>
                                <p>
                                    Enter the shipment and transportation details.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="shipment-close-btn"
                                onClick={resetForm}
                                disabled={saving}
                            >
                                <X size={21} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>

                            <div className="shipment-form-section">
                                <h3>
                                    <MapPin size={18} />
                                    Pickup Location
                                </h3>

                                <div className="shipment-form-grid">
                                    <div className="shipment-field full">
                                        <label>Pickup Address *</label>
                                        <input
                                            name="pickupAddress"
                                            value={formData.pickupAddress}
                                            onChange={handleChange}
                                            placeholder="Street, building, area"
                                            required
                                        />
                                    </div>

                                    <div className="shipment-field">
                                        <label>City *</label>
                                        <input
                                            name="pickupCity"
                                            value={formData.pickupCity}
                                            onChange={handleChange}
                                            placeholder="Ahmedabad"
                                            required
                                        />
                                    </div>

                                    <div className="shipment-field">
                                        <label>State *</label>
                                        <input
                                            name="pickupState"
                                            value={formData.pickupState}
                                            onChange={handleChange}
                                            placeholder="Gujarat"
                                            required
                                        />
                                    </div>

                                    <div className="shipment-field">
                                        <label>PIN Code *</label>
                                        <input
                                            name="pickupPincode"
                                            value={formData.pickupPincode}
                                            onChange={handleChange}
                                            placeholder="380015"
                                            inputMode="numeric"
                                            pattern="[0-9]{6}"
                                            maxLength={6}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="shipment-form-section">
                                <h3>
                                    <MapPin size={18} />
                                    Delivery Location
                                </h3>

                                <div className="shipment-form-grid">
                                    <div className="shipment-field full">
                                        <label>Delivery Address *</label>
                                        <input
                                            name="deliveryAddress"
                                            value={formData.deliveryAddress}
                                            onChange={handleChange}
                                            placeholder="Street, building, area"
                                            required
                                        />
                                    </div>

                                    <div className="shipment-field">
                                        <label>City *</label>
                                        <input
                                            name="deliveryCity"
                                            value={formData.deliveryCity}
                                            onChange={handleChange}
                                            placeholder="Delhi"
                                            required
                                        />
                                    </div>

                                    <div className="shipment-field">
                                        <label>State *</label>
                                        <input
                                            name="deliveryState"
                                            value={formData.deliveryState}
                                            onChange={handleChange}
                                            placeholder="Delhi"
                                            required
                                        />
                                    </div>

                                    <div className="shipment-field">
                                        <label>PIN Code *</label>
                                        <input
                                            name="deliveryPincode"
                                            value={formData.deliveryPincode}
                                            onChange={handleChange}
                                            placeholder="110001"
                                            inputMode="numeric"
                                            pattern="[0-9]{6}"
                                            maxLength={6}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="shipment-form-section">
                                <h3>
                                    <Package size={18} />
                                    Goods Details
                                </h3>

                                <div className="shipment-form-grid">
                                    <div className="shipment-field">
                                        <label>Goods Type *</label>
                                        <input
                                            name="goodsType"
                                            value={formData.goodsType}
                                            onChange={handleChange}
                                            placeholder="Electronics, Furniture..."
                                            required
                                        />
                                    </div>

                                    <div className="shipment-field">
                                        <label>Weight (kg) *</label>
                                        <input
                                            type="number"
                                            name="weightKg"
                                            min="1"
                                            step="0.1"
                                            value={formData.weightKg}
                                            onChange={handleChange}
                                            placeholder="250"
                                            required
                                        />
                                    </div>

                                    <div className="shipment-field">
                                        <label>Length (cm)</label>
                                        <input
                                            type="number"
                                            name="lengthCm"
                                            min="0"
                                            value={formData.lengthCm}
                                            onChange={handleChange}
                                            placeholder="100"
                                        />
                                    </div>

                                    <div className="shipment-field">
                                        <label>Width (cm)</label>
                                        <input
                                            type="number"
                                            name="widthCm"
                                            min="0"
                                            value={formData.widthCm}
                                            onChange={handleChange}
                                            placeholder="80"
                                        />
                                    </div>

                                    <div className="shipment-field">
                                        <label>Height (cm)</label>
                                        <input
                                            type="number"
                                            name="heightCm"
                                            min="0"
                                            value={formData.heightCm}
                                            onChange={handleChange}
                                            placeholder="60"
                                        />
                                    </div>

                                    <div className="shipment-field">
                                        <label>Pickup Date *</label>
                                        <input
                                            type="date"
                                            name="pickupDate"
                                            min={new Date().toLocaleDateString("en-CA")}
                                            value={formData.pickupDate}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="shipment-field full">
                                        <label>Description</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder="Additional information about your goods..."
                                            rows="3"
                                            maxLength={1000}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="shipment-form-actions">
                                <button
                                    type="button"
                                    className="shipment-cancel-btn"
                                    onClick={resetForm}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="shipment-submit-btn"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingShipment
                                            ? "Update Shipment"
                                            : "Create Shipment"}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

            <section className="shipment-list-section">
                <div className="shipment-list-heading">
                    <div>
                        <h2>My Shipments</h2>
                        <p>All shipment requests created by your account.</p>
                    </div>
                    <span>{shipments.length} Records</span>
                </div>

                {loading ? (
                    <div className="shipment-empty">
                        Loading your shipments...
                    </div>
                ) : shipments.length === 0 ? (
                    <div className="shipment-empty">
                        <Package size={45} />
                        <h3>No shipments yet</h3>
                        <p>Create your first shipment to get started.</p>
                        <button
                            className="shipment-add-btn"
                            onClick={openAddForm}
                        >
                            <Plus size={17} />
                            Create Shipment
                        </button>
                    </div>
                ) : (
                    <div className="shipment-cards">
                        {shipments.map((shipment) => (
                            <article
                                className="shipment-card"
                                key={shipment._id}
                            >
                                <div className="shipment-card-top">
                                    <div className="shipment-card-title">
                                        <div className="shipment-card-icon">
                                            <Package size={22} />
                                        </div>
                                        <div>
                                            <h3>{shipment.goodsType}</h3>
                                            <span>
                                                ID: {shipment._id.slice(-8).toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    <span className={getStatusClass(shipment.status)}>
                                        {statusLabels[shipment.status] || shipment.status}
                                    </span>
                                </div>

                                <div className="shipment-route">
                                    <div>
                                        <span>FROM</span>
                                        <strong>{shipment.pickupLocation?.city}</strong>
                                        <small>{shipment.pickupLocation?.state}</small>
                                    </div>

                                    <ArrowRight size={21} />

                                    <div>
                                        <span>TO</span>
                                        <strong>{shipment.deliveryLocation?.city}</strong>
                                        <small>{shipment.deliveryLocation?.state}</small>
                                    </div>
                                </div>

                                <div className="shipment-card-details">
                                    <span>
                                        <Weight size={15} />
                                        {shipment.weightKg} kg
                                    </span>

                                    <span>
                                        <CalendarDays size={15} />
                                        {formatDate(shipment.pickupDate)}
                                    </span>
                                </div>

                                {shipment.status === "booked" && shipment.bookedVehicleId && (
                                    <div className="shipment-booked-info">
                                        <CheckCircle size={18} />
                                        <div>
                                            <strong>Truck successfully booked</strong>
                                            <p>
                                                Assigned vehicle ID:{" "}
                                                {typeof shipment.bookedVehicleId === "object"
                                                    ? shipment.bookedVehicleId.vehicleNumber || shipment.bookedVehicleId._id
                                                    : shipment.bookedVehicleId}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {shipment.status === "pending" && (
                                    <>
                                        <div className="shipment-card-actions">
                                            <button
                                                className="shipment-edit-btn"
                                                onClick={() => openEditForm(shipment)}
                                            >
                                                <Pencil size={15} />
                                                Edit
                                            </button>

                                            <button
                                                className="shipment-delete-btn"
                                                onClick={() => handleCancelShipment(shipment._id)}
                                            >
                                                <Ban size={15} />
                                                Cancel Shipment
                                            </button>

                                            <button
                                                className="shipment-match-btn"
                                                onClick={() => handleFindMatches(shipment._id)}
                                                disabled={matchingLoading[shipment._id]}
                                            >
                                                <Truck size={16} />
                                                {matchingLoading[shipment._id]
                                                    ? "Finding Trucks..."
                                                    : "Find Matching Trucks"}
                                            </button>
                                        </div>

                                        {matchingErrors[shipment._id] && (
                                            <div className="shipment-alert shipment-alert-error">
                                                {matchingErrors[shipment._id]}
                                            </div>
                                        )}

                                        {bookingErrors[shipment._id] && (
                                            <div className="shipment-alert shipment-alert-error">
                                                {bookingErrors[shipment._id]}
                                            </div>
                                        )}

                                        {matchingResults[shipment._id] && (
                                            <div className="shipment-matching-results">
                                                <h4>
                                                    Matching Trucks ({matchingResults[shipment._id].length})
                                                </h4>

                                                {matchingResults[shipment._id].length === 0 ? (
                                                    <p>
                                                        No compatible trucks found for this shipment.
                                                    </p>
                                                ) : (
                                                    matchingResults[shipment._id].map((vehicle) => (
                                                        <div
                                                            className="shipment-match-card"
                                                            key={vehicle._id}
                                                        >
                                                            <div>
                                                                <strong>{vehicle.vehicleNumber}</strong>
                                                                <p>
                                                                    {vehicle.make || ""} {vehicle.model || ""}
                                                                </p>
                                                            </div>

                                                            <div className="shipment-match-route">
                                                                {vehicle.currentCity}
                                                                <ArrowRight size={15} />
                                                                {vehicle.destinationCity}
                                                            </div>

                                                            <div className="shipment-match-capacity">
                                                                <span>Available capacity</span>
                                                                <strong>
                                                                    {vehicle.availableCapacityKg ??
                                                                        vehicle.capacityKg} kg
                                                                </strong>
                                                            </div>

                                                            <span className="shipment-match-badge">
                                                                Compatible
                                                            </span>

                                                            <button
                                                                className="shipment-book-btn"
                                                                disabled={bookingLoading[shipment._id] !== undefined &&
                                                                    bookingLoading[shipment._id] !== null}
                                                                onClick={() => handleBookTruck(
                                                                    shipment._id,
                                                                    vehicle._id
                                                                )}
                                                            >
                                                                {bookingLoading[shipment._id] === vehicle._id
                                                                    ? "Booking..."
                                                                    : "Book This Truck"}
                                                            </button>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </article>
                        ))}
                    </div>
                )}
            </section>

        </div>
    );
}

export default ShipmentManagement;
