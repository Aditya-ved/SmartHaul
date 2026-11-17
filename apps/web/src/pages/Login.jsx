
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";

function Login() {
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await api.post("/auth/login", formData);

            localStorage.setItem(
                "smarthaul_token",
                response.data.token
            );

            window.dispatchEvent(new Event("auth-change"));

            const role = response.data.user.role;

            if (role === "driver") {
                navigate("/driver-dashboard");
            } else {
                navigate("/dashboard");
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Login failed. Please check your credentials."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <div className="auth-card">
                <Link to="/" className="auth-brand">
                    Smart<span>Haul</span>
                </Link>

                <h1>Welcome Back</h1>
                <p className="auth-subtitle">
                    Log in to continue to your SmartHaul account.
                </p>

                {location.state?.message && (
                    <div className="auth-success">
                        {location.state.message}
                    </div>
                )}

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <label htmlFor="email">Email Address</label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Log In"}
                    </button>
                </form>

                <p className="auth-footer">
                    Don't have an account?{" "}
                    <Link to="/register">Create Account</Link>
                </p>

                <Link to="/" className="auth-back">
                    Back to Home
                </Link>
            </div>
        </main>
    );
}

export default Login;
