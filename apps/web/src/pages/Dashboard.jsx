
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Package,
    Truck,
    MapPin,
    User,
    LogOut,
    ArrowRight,
    ShieldCheck,
    Users
} from "lucide-react";
import api from "../services/api";

function Dashboard() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);

    const canManageFleet = ["individual_owner", "company_admin"].includes(user?.role);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await api.get("/auth/me");
                setUser(response.data.user);

                if (["individual_owner", "company_admin"].includes(response.data.user.role)) {
                    try {
                        const vehicleResponse = await api.get("/vehicles");
                        setVehicles(vehicleResponse.data.vehicles || []);
                    } catch (vehicleError) {
                        console.error("Unable to load vehicles:", vehicleError);
                    }
                }
            } catch {
                localStorage.removeItem("smarthaul_token");
                window.dispatchEvent(new Event("auth-change"));
                navigate("/login", { replace: true });
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("smarthaul_token");
        window.dispatchEvent(new Event("auth-change"));
        navigate("/login", { replace: true });
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="dashboard-loader"></div>
                <p>Loading your SmartHaul workspace...</p>
            </div>
        );
    }

    if (!user) return null;

    const roleNames = {
        sender: "Sender",
        individual_owner: "Individual Truck Owner",
        company_admin: "Logistics Company",
        driver: "Driver",
        admin: "Administrator"
    };

    const firstName = user.fullName?.trim().split(" ")[0] || "User";
    const roleName = roleNames[user.role] || user.role;

    const totalVehicles = vehicles.length;

    const availableVehicles = vehicles.filter(
        (vehicle) => vehicle.availability === "available"
    ).length;

    const vehiclesOnTrip = vehicles.filter(
        (vehicle) => vehicle.availability === "on_trip"
    ).length;

    return (
        <div className="dashboard-layout">
            <aside className="dashboard-sidebar">
                <Link to="/" className="dashboard-brand">
                    <span className="dashboard-brand-icon">
                        <Truck size={24} />
                    </span>
                    <span>
                        Smart<span>Haul</span>
                    </span>
                </Link>

                <div className="dashboard-sidebar-label">
                    WORKSPACE
                </div>

                <nav className="dashboard-nav">
                    <Link to="/dashboard" className="active">
                        <LayoutDashboard size={19} />
                        Overview
                    </Link>

                    <Link to="/shipments">
                        <Package size={19} />
                        My Shipments
                    </Link>

                    {canManageFleet && (
                        <>
                            <Link to="/fleet">
                                <Truck size={19} />
                                Fleet Management
                            </Link>

                            <Link to="/drivers">
                                <Users size={19} />
                                Driver Management
                            </Link>
                        </>
                    )}

                    <a href="#tracking">
                        <MapPin size={19} />
                        Tracking
                    </a>

                    <a href="#profile">
                        <User size={19} />
                        My Profile
                    </a>
                </nav>

                <div className="dashboard-sidebar-bottom">
                    <div className="dashboard-sidebar-user">
                        <div className="user-avatar">
                            {user.fullName?.charAt(0).toUpperCase()}
                        </div>

                        <div className="dashboard-sidebar-user-info">
                            <strong>{user.fullName}</strong>
                            <small>{roleName}</small>
                        </div>
                    </div>

                    <button className="dashboard-logout" onClick={handleLogout}>
                        <LogOut size={18} />
                        Log Out
                    </button>
                </div>
            </aside>

            <main className="dashboard-main">
                <header className="dashboard-header">
                    <div>
                        <span className="dashboard-page-label">
                            YOUR WORKSPACE
                        </span>
                        <h1>Dashboard</h1>
                        <p>Manage your logistics activities from one place.</p>
                    </div>

                    <div className="dashboard-user">
                        <div className="user-avatar">
                            {user.fullName?.charAt(0).toUpperCase()}
                        </div>

                        <div>
                            <strong>{user.fullName}</strong>
                            <small>{roleName}</small>
                        </div>
                    </div>
                </header>

                <section className="dashboard-welcome">
                    <div className="dashboard-welcome-content">
                        <span className="section-label">
                            SMART FREIGHT MANAGEMENT
                        </span>

                        <h2>Hello, {firstName}!</h2>

                        <p>
                            Welcome to SmartHaul. Manage your vehicles,
                            organize shipments and discover smarter
                            transportation opportunities.
                        </p>

                        <Link to="/fleet" className="dashboard-welcome-btn">
                            Manage Your Fleet
                            <ArrowRight size={17} />
                        </Link>
                    </div>

                    <div className="dashboard-welcome-icon">
                        <Truck size={82} />
                    </div>
                </section>

                {canManageFleet && (
                    <section className="dashboard-stats">
                        <article className="dashboard-stat">
                            <div className="dashboard-stat-icon shipment-icon">
                                <Truck size={22} />
                            </div>
                            <div>
                                <h3>{totalVehicles}</h3>
                                <p>Total Vehicles</p>
                            </div>
                        </article>

                        <article className="dashboard-stat">
                            <div className="dashboard-stat-icon booking-icon">
                                <Truck size={22} />
                            </div>
                            <div>
                                <h3>{availableVehicles}</h3>
                                <p>Available Vehicles</p>
                            </div>
                        </article>

                        <article className="dashboard-stat">
                            <div className="dashboard-stat-icon delivery-icon">
                                <MapPin size={22} />
                            </div>
                            <div>
                                <h3>{vehiclesOnTrip}</h3>
                                <p>Vehicles On Trip</p>
                            </div>
                        </article>
                    </section>
                )}

                <section className="dashboard-content" id="shipments">
                    <div className="dashboard-section-heading">
                        <div>
                            <h2>Quick Actions</h2>
                            <p>Access your SmartHaul services.</p>
                        </div>
                    </div>

                    <div className="dashboard-actions">
                        <article className="dashboard-action-card">
                            <div className="dashboard-action-icon shipment-icon">
                                <Package size={25} />
                            </div>

                            <h3>Create Shipment</h3>
                            <p>
                                Submit your goods details and find suitable
                                transportation.
                            </p>

                            <Link to="/shipments" className="dashboard-action-link">
                                Create Shipment
                                <ArrowRight size={16} />
                            </Link>
                        </article>

                        {canManageFleet && (
                            <>
                                <article className="dashboard-action-card">
                                    <div className="dashboard-action-icon booking-icon">
                                        <Truck size={25} />
                                    </div>

                                    <h3>Manage Vehicles</h3>
                                    <p>
                                        Register vehicles and manage your available
                                        truck capacity.
                                    </p>

                                    <Link to="/fleet" className="dashboard-action-link">
                                        Open Fleet Management
                                        <ArrowRight size={16} />
                                    </Link>
                                </article>

                                <article className="dashboard-action-card">
                                    <div className="dashboard-action-icon delivery-icon">
                                        <Users size={25} />
                                    </div>

                                    <h3>Manage Drivers</h3>
                                    <p>
                                        Register drivers, view driver details and
                                        assign drivers to your vehicles.
                                    </p>

                                    <Link to="/drivers" className="dashboard-action-link">
                                        Open Driver Management
                                        <ArrowRight size={16} />
                                    </Link>
                                </article>
                            </>
                        )}

                        <article className="dashboard-action-card" id="tracking">
                            <div className="dashboard-action-icon delivery-icon">
                                <MapPin size={25} />
                            </div>

                            <h3>Track Shipment</h3>
                            <p>
                                Monitor shipment progress and delivery
                                locations.
                            </p>

                            <button disabled className="dashboard-coming-btn">
                                <MapPin size={16} />
                                Coming Soon
                            </button>
                        </article>
                    </div>
                </section>

                <section className="dashboard-profile" id="profile">
                    <div className="dashboard-profile-heading">
                        <div className="dashboard-profile-icon">
                            <ShieldCheck size={23} />
                        </div>

                        <div>
                            <h2>Account Information</h2>
                            <p>Your registered account details.</p>
                        </div>
                    </div>

                    <div className="dashboard-profile-grid">
                        <div>
                            <span>Full Name</span>
                            <strong>{user.fullName}</strong>
                        </div>

                        <div>
                            <span>Email Address</span>
                            <strong>{user.email}</strong>
                        </div>

                        <div>
                            <span>Phone Number</span>
                            <strong>{user.phone || "Not provided"}</strong>
                        </div>

                        <div>
                            <span>Account Type</span>
                            <strong>{roleName}</strong>
                        </div>
                    </div>
                </section>

                <footer className="dashboard-footer">
                    <p>
                        © 2026 SmartHaul. Smart freight, smarter journeys.
                    </p>
                </footer>
            </main>
        </div>
    );
}

export default Dashboard;
