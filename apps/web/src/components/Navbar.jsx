
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Truck,
    UserCircle,
    LogOut,
    LayoutDashboard,
    Menu,
    X
} from "lucide-react";
import api from "../services/api";

function Navbar() {
    const [user, setUser] = useState(null);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const getDashboardPath = (role) => {
        if (role === "admin") return "/admin-dashboard";
        if (role === "driver") return "/driver-dashboard";
        return "/dashboard";
    };

    useEffect(() => {
        let active = true;

        const checkUser = async () => {
            const token = localStorage.getItem("smarthaul_token");

            if (!token) {
                if (active) {
                    setUser(null);
                    setCheckingAuth(false);
                }
                return;
            }

            try {
                const response = await api.get("/auth/me");

                if (active) {
                    setUser(response.data.user);
                }
            } catch {
                localStorage.removeItem("smarthaul_token");

                if (active) {
                    setUser(null);
                }
            } finally {
                if (active) {
                    setCheckingAuth(false);
                }
            }
        };

        checkUser();

        window.addEventListener("auth-change", checkUser);

        return () => {
            active = false;
            window.removeEventListener("auth-change", checkUser);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("smarthaul_token");
        setUser(null);
        setMobileMenuOpen(false);

        window.dispatchEvent(new Event("auth-change"));

        window.location.replace("/");
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    const dashboardPath = user
        ? getDashboardPath(user.role)
        : "/login";

    const canManageFleet = user &&
        ["individual_owner", "company_admin"].includes(user.role);

    return (
        <header className="navbar">
            <Link
                to="/"
                className="brand"
                onClick={closeMobileMenu}
            >
                <span className="brand-icon">
                    <Truck size={25} />
                </span>

                <span>
                    Smart<span className="brand-highlight">Haul</span>
                </span>
            </Link>

            <nav className={`nav-links ${mobileMenuOpen ? "mobile-open" : ""}`}>
                <a href="/#services" onClick={closeMobileMenu}>
                    Services
                </a>

                <a href="/#how-it-works" onClick={closeMobileMenu}>
                    How It Works
                </a>

                <a href="/#about" onClick={closeMobileMenu}>
                    About Us
                </a>

                {canManageFleet && (
                    <Link
                        to="/fleet"
                        className="mobile-fleet-link"
                        onClick={closeMobileMenu}
                    >
                        Fleet Management
                    </Link>
                )}
            </nav>

            <div className="nav-actions">
                {!checkingAuth && (
                    user ? (
                        <div className="nav-user">
                            <Link
                                to={dashboardPath}
                                className="profile-link"
                                onClick={closeMobileMenu}
                            >
                                <UserCircle size={22} />
                                <span>{user.fullName}</span>
                            </Link>

                            {canManageFleet && (
                                <Link
                                    to="/fleet"
                                    className="dashboard-link"
                                    onClick={closeMobileMenu}
                                >
                                    <Truck size={17} />
                                    My Fleet
                                </Link>
                            )}

                            <Link
                                to={dashboardPath}
                                className="dashboard-link"
                                onClick={closeMobileMenu}
                            >
                                <LayoutDashboard size={17} />
                                Dashboard
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="logout-link"
                            >
                                <LogOut size={17} />
                                Log out
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="login-link">
                                Log in
                            </Link>

                            <Link to="/register" className="nav-button">
                                Get Started
                            </Link>
                        </>
                    )
                )}
            </div>

            <button
                className="navbar-menu-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
            >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        </header>
    );
}

export default Navbar;
