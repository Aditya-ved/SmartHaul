
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
    ShieldCheck,
    Truck,
    CheckCircle,
    XCircle,
    RefreshCw,
    LogOut,
    Clock
} from "lucide-react";
import "./AdminDashboard.css";

const tabs = [
    { id: "pending", label: "Pending Vehicles", icon: Clock },
    { id: "verified", label: "Verified Vehicles", icon: CheckCircle },
    { id: "rejected", label: "Rejected Vehicles", icon: XCircle }
];

function AdminDashboard() {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("pending");
    const [vehicles, setVehicles] = useState([]);
    const [counts, setCounts] = useState({
        pending: 0,
        verified: 0,
        rejected: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState("");

    const fetchVehicles = async (status = activeTab) => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(`/admin/vehicles/${status}`);

            setVehicles(response.data.vehicles || []);

            setCounts((current) => ({
                ...current,
                [status]: response.data.count || 0
            }));
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load vehicles."
            );
        } finally {
            setLoading(false);
        }
    };

    const refreshAllCounts = async () => {
        try {
            const statuses = ["pending", "verified", "rejected"];

            const results = await Promise.all(
                statuses.map((status) =>
                    api.get(`/admin/vehicles/${status}`)
                )
            );

            const newCounts = {};

            statuses.forEach((status, index) => {
                newCounts[status] = results[index].data.count || 0;
            });

            setCounts(newCounts);
        } catch (err) {
            console.error("Unable to refresh vehicle counts:", err);
        }
    };

    useEffect(() => {
        fetchVehicles(activeTab);
    }, [activeTab]);

    useEffect(() => {
        refreshAllCounts();
    }, []);

    const handleVerification = async (vehicleId, verificationStatus) => {
        const action =
            verificationStatus === "verified" ? "approve" : "reject";

        if (!window.confirm(`Are you sure you want to ${action} this vehicle?`)) {
            return;
        }

        try {
            setUpdatingId(vehicleId);

            await api.patch(
                `/admin/vehicles/${vehicleId}/verification`,
                { verificationStatus }
            );

            await fetchVehicles(activeTab);
            await refreshAllCounts();
        } catch (err) {
            alert(
                err.response?.data?.message ||
                "Unable to update vehicle verification."
            );
        } finally {
            setUpdatingId("");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("smarthaul_token");

        window.dispatchEvent(new Event("auth-change"));

        window.location.replace("/");
    };

    const titleByTab = {
        pending: "Pending Verification Requests",
        verified: "Verified Vehicles",
        rejected: "Rejected Vehicles"
    };

    const descriptionByTab = {
        pending: "Vehicles waiting for admin review",
        verified: "Vehicles approved for the marketplace",
        rejected: "Vehicles that were not approved"
    };

    return (
        <div className="admin-page">
            <header className="admin-header">
                <div className="admin-brand">
                    <ShieldCheck size={28} />
                    <div>
                        <h2>SmartHaul Admin</h2>
                        <span>Administration Panel</span>
                    </div>
                </div>

                <button className="admin-logout" onClick={handleLogout}>
                    <LogOut size={17} />
                    Logout
                </button>
            </header>

            <main className="admin-content">
                <section className="admin-welcome">
                    <div>
                        <span className="admin-eyebrow">ADMINISTRATION</span>
                        <h1>Vehicle Management</h1>
                        <p>
                            Review registrations and manage vehicle
                            verification across the SmartHaul marketplace.
                        </p>
                    </div>

                    <button
                        className="admin-refresh"
                        onClick={() => {
                            fetchVehicles(activeTab);
                            refreshAllCounts();
                        }}
                        disabled={loading}
                    >
                        <RefreshCw size={17} />
                        Refresh
                    </button>
                </section>

                <section className="admin-stats-grid">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;

                        return (
                            <div className="admin-stat-card" key={tab.id}>
                                <div className="admin-stat-icon">
                                    <Icon size={25} />
                                </div>
                                <div>
                                    <span>{tab.label}</span>
                                    <h2>{counts[tab.id]}</h2>
                                </div>
                            </div>
                        );
                    })}
                </section>

                <section className="admin-vehicle-section">
                    <div className="admin-tabs">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;

                            return (
                                <button
                                    key={tab.id}
                                    className={
                                        activeTab === tab.id
                                            ? "admin-tab active"
                                            : "admin-tab"
                                    }
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    <Icon size={17} />
                                    {tab.label}
                                    <span>{counts[tab.id]}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="admin-section-heading">
                        <div>
                            <h2>{titleByTab[activeTab]}</h2>
                            <p>{descriptionByTab[activeTab]}</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="admin-message">
                            Loading vehicles...
                        </div>
                    ) : error ? (
                        <div className="admin-error">{error}</div>
                    ) : vehicles.length === 0 ? (
                        <div className="admin-empty">
                            <CheckCircle size={38} />
                            <h3>No vehicles found</h3>
                            <p>
                                There are currently no vehicles in this category.
                            </p>
                        </div>
                    ) : (
                        <div className="admin-vehicle-list">
                            {vehicles.map((vehicle) => (
                                <article
                                    className="admin-vehicle-card"
                                    key={vehicle._id}
                                >
                                    <div className="admin-vehicle-top">
                                        <div className="admin-vehicle-icon">
                                            <Truck size={25} />
                                        </div>

                                        <div className="admin-vehicle-title">
                                            <h3>{vehicle.vehicleNumber}</h3>
                                            <span>
                                                {vehicle.make} {vehicle.model}
                                            </span>
                                        </div>

                                        <span
                                            className={`admin-pending-badge ${vehicle.verificationStatus}`}
                                        >
                                            {vehicle.verificationStatus}
                                        </span>
                                    </div>

                                    <div className="admin-vehicle-details">
                                        <div>
                                            <span>Vehicle Type</span>
                                            <strong>{vehicle.vehicleType}</strong>
                                        </div>

                                        <div>
                                            <span>Capacity</span>
                                            <strong>{vehicle.capacityKg} kg</strong>
                                        </div>

                                        <div>
                                            <span>Route</span>
                                            <strong>
                                                {vehicle.currentCity || "Not specified"}
                                                {" → "}
                                                {vehicle.destinationCity || "Not specified"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Owner</span>
                                            <strong>
                                                {vehicle.ownerId?.fullName || "Unknown"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Owner Email</span>
                                            <strong>
                                                {vehicle.ownerId?.email || "Not available"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Owner Phone</span>
                                            <strong>
                                                {vehicle.ownerId?.phone || "Not available"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Assigned Driver</span>
                                            <strong>
                                                {vehicle.assignedDriver?.fullName || "Not assigned"}
                                            </strong>
                                        </div>
                                    </div>

                                    {activeTab === "pending" && (
                                        <div className="admin-vehicle-actions">
                                            <button
                                                className="admin-approve"
                                                onClick={() =>
                                                    handleVerification(
                                                        vehicle._id,
                                                        "verified"
                                                    )
                                                }
                                                disabled={updatingId === vehicle._id}
                                            >
                                                <CheckCircle size={17} />
                                                {updatingId === vehicle._id
                                                    ? "Processing..."
                                                    : "Approve Vehicle"}
                                            </button>

                                            <button
                                                className="admin-reject"
                                                onClick={() =>
                                                    handleVerification(
                                                        vehicle._id,
                                                        "rejected"
                                                    )
                                                }
                                                disabled={updatingId === vehicle._id}
                                            >
                                                <XCircle size={17} />
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default AdminDashboard;
