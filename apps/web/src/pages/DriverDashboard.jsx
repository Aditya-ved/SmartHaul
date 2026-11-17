import "./DriverDashboard.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
    Truck,
    Package,
    MapPin,
    LogOut,
    RefreshCw,
    Weight,
    CalendarDays,
    ArrowRight,
    CheckCircle,
    Clock
} from "lucide-react";

function formatLocation(location) {
    if (!location) return "Not available";
    if (typeof location === "string") return location;

    return [
        location.address,
        location.city,
        location.state,
        location.pincode
    ].filter(Boolean).join(", ") || "Not available";
}

function DriverDashboard() {
    const navigate = useNavigate();

    const [data, setData] = useState({
        vehicles: [],
        shipments: []
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState("");

    const token = localStorage.getItem("smarthaul_token");

    const fetchWork = async () => {
        try {
            setError("");

            const response = await axios.get(
                "http://localhost:5000/api/drivers/my-work",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setData(response.data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load dashboard."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWork();
    }, []);

    const logout = () => {
        localStorage.removeItem("smarthaul_token");
        window.dispatchEvent(new Event("auth-change"));
        navigate("/login");
    };

    const updateShipmentStatus = async (shipmentId, status) => {
        try {
            setUpdatingId(shipmentId);

            await axios.patch(
                `http://localhost:5000/api/shipments/${shipmentId}/status`,
                { status },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            await fetchWork();
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Unable to update shipment status."
            );
        } finally {
            setUpdatingId("");
        }
    };

    if (loading) {
        return (
            <div className="driver-loading">
                <RefreshCw className="spin" size={28} />
                <p>Loading your dashboard...</p>
            </div>
        );
    }

    const totalCapacity = data.vehicles.reduce(
        (total, vehicle) => total + (vehicle.capacityKg || 0),
        0
    );

    const availableCapacity = data.vehicles.reduce(
        (total, vehicle) => total + (vehicle.availableCapacityKg || 0),
        0
    );

    const activeShipments = data.shipments.filter(
        shipment => ["booked", "in_transit"].includes(shipment.status)
    );

    return (
        <div className="driver-page">

            <header className="driver-navbar">
                <div className="driver-brand">
                    <div className="driver-brand-icon">
                        <Truck size={23} />
                    </div>
                    <span>Smart<span>Haul</span></span>
                </div>

                <div className="driver-nav-right">
                    <span className="driver-role">Driver Portal</span>

                    <button className="driver-logout" onClick={logout}>
                        <LogOut size={17} />
                        Logout
                    </button>
                </div>
            </header>

            <main className="driver-main">

                <section className="driver-welcome">
                    <div>
                        <p className="driver-eyebrow">DRIVER WORKSPACE</p>
                        <h1>Driver Dashboard</h1>
                        <p>Manage your assigned vehicle and delivery journeys.</p>
                    </div>

                    <button className="driver-refresh" onClick={fetchWork}>
                        <RefreshCw size={17} />
                        Refresh
                    </button>
                </section>

                {error && (
                    <div className="driver-error">
                        {error}
                    </div>
                )}

                <section className="driver-stats">

                    <div className="driver-stat">
                        <div className="driver-stat-icon blue">
                            <Truck size={22} />
                        </div>
                        <div>
                            <p>Assigned Vehicles</p>
                            <h2>{data.vehicles.length}</h2>
                        </div>
                    </div>

                    <div className="driver-stat">
                        <div className="driver-stat-icon purple">
                            <Weight size={22} />
                        </div>
                        <div>
                            <p>Total Capacity</p>
                            <h2>{totalCapacity.toLocaleString()} kg</h2>
                        </div>
                    </div>

                    <div className="driver-stat">
                        <div className="driver-stat-icon green">
                            <CheckCircle size={22} />
                        </div>
                        <div>
                            <p>Available Capacity</p>
                            <h2>{availableCapacity.toLocaleString()} kg</h2>
                        </div>
                    </div>

                    <div className="driver-stat">
                        <div className="driver-stat-icon orange">
                            <Package size={22} />
                        </div>
                        <div>
                            <p>Active Shipments</p>
                            <h2>{activeShipments.length}</h2>
                        </div>
                    </div>

                </section>

                <section className="driver-section">
                    <div className="driver-section-heading">
                        <div>
                            <h2>My Assigned Truck</h2>
                            <p>Vehicle information and capacity</p>
                        </div>
                    </div>

                    {data.vehicles.length === 0 ? (
                        <div className="driver-empty">
                            No truck assigned yet.
                        </div>
                    ) : (
                        <div className="driver-vehicle-grid">
                            {data.vehicles.map(vehicle => (
                                <div className="driver-vehicle-card" key={vehicle._id}>
                                    <div className="vehicle-card-top">
                                        <div className="vehicle-icon">
                                            <Truck size={27} />
                                        </div>
                                        <span className="vehicle-status">
                                            {vehicle.status}
                                        </span>
                                    </div>

                                    <h3>{vehicle.vehicleNumber}</h3>
                                    <p className="vehicle-type">
                                        {vehicle.vehicleType?.replace("_", " ")}
                                    </p>

                                    <div className="vehicle-route">
                                        <MapPin size={17} />
                                        <span>
                                            {vehicle.currentCity} <ArrowRight size={14} /> {vehicle.destinationCity}
                                        </span>
                                    </div>

                                    <div className="vehicle-capacity">
                                        <div>
                                            <span>Total capacity</span>
                                            <strong>{vehicle.capacityKg} kg</strong>
                                        </div>
                                        <div>
                                            <span>Available</span>
                                            <strong>{vehicle.availableCapacityKg} kg</strong>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="driver-section">
                    <div className="driver-section-heading">
                        <div>
                            <h2>My Shipments</h2>
                            <p>Track and manage your assigned deliveries</p>
                        </div>

                        <span className="shipment-count">
                            {data.shipments.length} Total
                        </span>
                    </div>

                    {data.shipments.length === 0 ? (
                        <div className="driver-empty">
                            No shipments assigned yet.
                        </div>
                    ) : (
                        <div className="driver-shipment-grid">
                            {data.shipments.map(shipment => (
                                <div className="driver-shipment-card" key={shipment._id}>

                                    <div className="shipment-card-header">
                                        <div className="shipment-goods">
                                            <div className="shipment-icon">
                                                <Package size={21} />
                                            </div>
                                            <div>
                                                <h3>{shipment.goodsType}</h3>
                                                <span>#{shipment._id.slice(-8)}</span>
                                            </div>
                                        </div>

                                        <span className={`shipment-badge ${shipment.status}`}>
                                            {shipment.status.replace("_", " ")}
                                        </span>
                                    </div>

                                    <div className="shipment-route">
                                        <div className="route-point">
                                            <span className="route-dot pickup"></span>
                                            <div>
                                                <small>PICKUP LOCATION</small>
                                                <p>{formatLocation(shipment.pickupLocation)}</p>
                                            </div>
                                        </div>

                                        <div className="route-line"></div>

                                        <div className="route-point">
                                            <span className="route-dot delivery"></span>
                                            <div>
                                                <small>DELIVERY LOCATION</small>
                                                <p>{formatLocation(shipment.deliveryLocation)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="shipment-details">
                                        <div>
                                            <Weight size={16} />
                                            {shipment.weightKg} kg
                                        </div>

                                        <div>
                                            <CalendarDays size={16} />
                                            {shipment.pickupDate
                                                ? new Date(shipment.pickupDate).toLocaleDateString("en-IN")
                                                : "Date unavailable"}
                                        </div>
                                    </div>

                                    {shipment.status === "booked" && (
                                        <button
                                            className="shipment-action start"
                                            disabled={updatingId === shipment._id}
                                            onClick={() =>
                                                updateShipmentStatus(shipment._id, "in_transit")
                                            }
                                        >
                                            <ArrowRight size={17} />
                                            {updatingId === shipment._id ? "Updating..." : "Start Journey"}
                                        </button>
                                    )}

                                    {shipment.status === "in_transit" && (
                                        <button
                                            className="shipment-action complete"
                                            disabled={updatingId === shipment._id}
                                            onClick={() =>
                                                updateShipmentStatus(shipment._id, "delivered")
                                            }
                                        >
                                            <CheckCircle size={17} />
                                            {updatingId === shipment._id ? "Updating..." : "Mark Delivered"}
                                        </button>
                                    )}

                                    {shipment.status === "delivered" && (
                                        <div className="shipment-completed">
                                            <CheckCircle size={17} />
                                            Delivery completed
                                        </div>
                                    )}

                                </div>
                            ))}
                        </div>
                    )}
                </section>

            </main>

            <footer className="driver-footer">
                SmartHaul Driver Portal · Manage your journeys efficiently
            </footer>
        </div>
    );
}

export default DriverDashboard;
