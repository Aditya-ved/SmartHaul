
import { useEffect, useState } from "react";
import {
    Users,
    UserPlus,
    Truck,
    Trash2,
    UserRoundCheck,
    UserRoundX,
    RefreshCw
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "./DriverManagement.css";

function DriverManagement() {
    const [drivers, setDrivers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: ""
    });

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [driverResponse, vehicleResponse] = await Promise.all([
                api.get("/drivers"),
                api.get("/vehicles")
            ]);

            setDrivers(driverResponse.data.drivers || []);
            setVehicles(vehicleResponse.data.vehicles || []);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load driver information");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const registerDriver = async (e) => {
        e.preventDefault();

        try {
            setSubmitting(true);
            setError("");
            setMessage("");

            const response = await api.post("/drivers", form);

            setMessage(response.data.message);
            setForm({
                fullName: "",
                email: "",
                phone: "",
                password: ""
            });

            await loadData();
        } catch (err) {
            setError(err.response?.data?.message || "Driver registration failed");
        } finally {
            setSubmitting(false);
        }
    };

    const assignDriver = async (vehicleId, driverId) => {
        try {
            setError("");
            setMessage("");

            await api.patch(`/vehicles/${vehicleId}/assign-driver`, {
                driverId
            });

            setMessage("Driver assigned successfully");
            await loadData();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to assign driver");
        }
    };

    const removeDriver = async (vehicleId) => {
        try {
            setError("");
            setMessage("");

            await api.patch(`/vehicles/${vehicleId}/remove-driver`);

            setMessage("Driver removed from vehicle successfully");
            await loadData();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to remove driver");
        }
    };

    const deleteDriver = async (driverId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this driver?"
        );

        if (!confirmed) return;

        try {
            setError("");
            setMessage("");

            await api.delete(`/drivers/${driverId}`);

            setMessage("Driver deleted successfully");
            await loadData();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete driver");
        }
    };

    const assignedDriverIds = vehicles
        .filter((vehicle) => vehicle.assignedDriver)
        .map((vehicle) => String(vehicle.assignedDriver._id));

    const getAssignedVehicle = (driverId) => {
        return vehicles.find(
            (vehicle) =>
                vehicle.assignedDriver &&
                String(vehicle.assignedDriver._id) === String(driverId)
        );
    };

    if (loading) {
        return (
            <div className="driver-page">
                <div className="driver-loading">
                    <RefreshCw className="spin" size={24} />
                    <p>Loading driver management...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="driver-page">
            <header className="driver-header">
                <div>
                    <Link to="/dashboard" className="driver-back">
                        ← Back to Dashboard
                    </Link>
                    <h1>Driver Management</h1>
                    <p>Register drivers and manage your vehicle assignments.</p>
                </div>

                <button className="driver-refresh" onClick={loadData}>
                    <RefreshCw size={17} />
                    Refresh
                </button>
            </header>

            {message && <div className="driver-alert success">{message}</div>}
            {error && <div className="driver-alert error">{error}</div>}

            <section className="driver-stats">
                <div className="driver-stat-card">
                    <Users size={23} />
                    <div>
                        <span>Total Drivers</span>
                        <strong>{drivers.length}</strong>
                    </div>
                </div>

                <div className="driver-stat-card">
                    <UserRoundCheck size={23} />
                    <div>
                        <span>Assigned Drivers</span>
                        <strong>{assignedDriverIds.length}</strong>
                    </div>
                </div>

                <div className="driver-stat-card">
                    <UserRoundX size={23} />
                    <div>
                        <span>Unassigned Drivers</span>
                        <strong>{drivers.length - assignedDriverIds.length}</strong>
                    </div>
                </div>
            </section>

            <section className="driver-content">
                <div className="driver-form-card">
                    <div className="driver-section-title">
                        <UserPlus size={21} />
                        <div>
                            <h2>Register New Driver</h2>
                            <p>Create a driver account for your fleet.</p>
                        </div>
                    </div>

                    <form onSubmit={registerDriver}>
                        <label>Full Name</label>
                        <input
                            name="fullName"
                            value={form.fullName}
                            onChange={handleChange}
                            placeholder="Enter driver name"
                            required
                        />

                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="driver@example.com"
                            required
                        />

                        <label>Phone Number</label>
                        <input
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="Enter phone number"
                        />

                        <label>Temporary Password</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Minimum 8 characters"
                            minLength={8}
                            required
                        />

                        <button
                            type="submit"
                            className="driver-primary-btn"
                            disabled={submitting}
                        >
                            <UserPlus size={18} />
                            {submitting ? "Registering..." : "Register Driver"}
                        </button>
                    </form>
                </div>

                <div className="driver-list-card">
                    <div className="driver-section-title">
                        <Users size={21} />
                        <div>
                            <h2>Registered Drivers</h2>
                            <p>{drivers.length} drivers in your fleet.</p>
                        </div>
                    </div>

                    {drivers.length === 0 ? (
                        <div className="driver-empty">
                            <Users size={38} />
                            <h3>No drivers registered</h3>
                            <p>Register your first driver using the form.</p>
                        </div>
                    ) : (
                        <div className="driver-list">
                            {drivers.map((driver) => {
                                const assignedVehicle = getAssignedVehicle(driver._id);
                                const isAssigned = Boolean(assignedVehicle);

                                return (
                                    <div className="driver-item" key={driver._id}>
                                        <div className="driver-avatar">
                                            {driver.fullName?.charAt(0).toUpperCase()}
                                        </div>

                                        <div className="driver-info">
                                            <h3>{driver.fullName}</h3>
                                            <p>{driver.email}</p>
                                            <p>{driver.phone || "No phone number"}</p>

                                            <span className={`driver-status ${isAssigned ? "assigned" : "unassigned"}`}>
                                                {isAssigned
                                                    ? `Assigned: ${assignedVehicle.vehicleNumber}`
                                                    : "Not assigned"}
                                            </span>

                                            {driver.status && (
                                                <span className="driver-account-status">
                                                    Account: {driver.status}
                                                </span>
                                            )}
                                        </div>

                                        <button
                                            className="driver-delete-btn"
                                            onClick={() => deleteDriver(driver._id)}
                                            title="Delete driver"
                                        >
                                            <Trash2 size={17} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            <section className="driver-assignments">
                <div className="driver-section-title">
                    <Truck size={21} />
                    <div>
                        <h2>Vehicle Assignments</h2>
                        <p>Assign registered drivers to your vehicles.</p>
                    </div>
                </div>

                {vehicles.length === 0 ? (
                    <div className="driver-empty">
                        <Truck size={38} />
                        <h3>No vehicles registered</h3>
                        <p>Add a vehicle before assigning a driver.</p>
                        <Link to="/fleet">Open Fleet Management</Link>
                    </div>
                ) : (
                    <div className="assignment-grid">
                        {vehicles.map((vehicle) => (
                            <div className="assignment-card" key={vehicle._id}>
                                <div className="assignment-vehicle">
                                    <Truck size={22} />
                                    <div>
                                        <h3>{vehicle.vehicleNumber}</h3>
                                        <p>{vehicle.vehicleType}</p>
                                    </div>
                                </div>

                                {vehicle.assignedDriver ? (
                                    <div className="assigned-driver-box">
                                        <UserRoundCheck size={19} />
                                        <div>
                                            <strong>{vehicle.assignedDriver.fullName}</strong>
                                            <span>{vehicle.assignedDriver.phone || vehicle.assignedDriver.email}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="unassigned-driver-box">
                                        No driver assigned
                                    </div>
                                )}

                                {vehicle.assignedDriver ? (
                                    <button
                                        className="driver-remove-btn"
                                        onClick={() => removeDriver(vehicle._id)}
                                        disabled={vehicle.availability === "on_trip"}
                                    >
                                        <UserRoundX size={17} />
                                        Remove Driver
                                    </button>
                                ) : (
                                    <select
                                        className="driver-select"
                                        defaultValue=""
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                assignDriver(vehicle._id, e.target.value);
                                                e.target.value = "";
                                            }
                                        }}
                                        disabled={vehicle.availability === "on_trip"}
                                    >
                                        <option value="">Select a driver</option>
                                        {drivers
                                            .filter(
                                                (driver) =>
                                                    !assignedDriverIds.includes(String(driver._id)) &&
                                                    driver.status === "active"
                                            )
                                            .map((driver) => (
                                                <option value={driver._id} key={driver._id}>
                                                    {driver.fullName}
                                                </option>
                                            ))}
                                    </select>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default DriverManagement;
