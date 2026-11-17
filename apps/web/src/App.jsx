
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import FleetManagement from "./pages/FleetManagement";
import DriverManagement from "./pages/DriverManagement";
import ShipmentManagement from "./pages/ShipmentManagement";
import ProtectedRoute from "./components/ProtectedRoute";

import "./App.css";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Sender and truck owner pages */}
                <Route
                    element={
                        <ProtectedRoute
                            allowedRoles={[
                                "sender",
                                "individual_owner",
                                "company_admin"
                            ]}
                        />
                    }
                >
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/fleet" element={<FleetManagement />} />
                    <Route path="/drivers" element={<DriverManagement />} />
                    <Route path="/shipments" element={<ShipmentManagement />} />
                </Route>

                {/* Driver pages */}
                <Route
                    element={
                        <ProtectedRoute allowedRoles={["driver"]} />
                    }
                >
                    <Route
                        path="/driver-dashboard"
                        element={<div>Driver Dashboard Coming Soon</div>}
                    />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
