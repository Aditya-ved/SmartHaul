
import {
    ArrowRight,
    ArrowUpRight,
    Package,
    Truck,
    Building2,
    MapPin,
    ShieldCheck,
    Clock,
    Route
} from "lucide-react";

import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function Home() {
    return (
        <>
            <Navbar />

            <main>
                <section className="hero">
                    <div className="hero-content">
                        <div className="eyebrow">
                            <span className="status-dot"></span>
                            SMARTER LOGISTICS. BETTER CONNECTIVITY.
                        </div>

                        <h1>
                            Move Goods <span>Smarter.</span>
                            <br />
                            Move Business Forward.
                        </h1>

                        <p>
                            Connect with verified truck owners and logistics
                            companies. Book complete vehicles or use available
                            truck capacity at better prices.
                        </p>

                        <div className="hero-actions">
                            <Link to="/register" className="primary-button">
                                Start Shipping <ArrowRight size={18} />
                            </Link>

                            <a href="#how-it-works" className="secondary-button">
                                Explore Platform
                            </a>
                        </div>

                        <div className="hero-trust">
                            <ShieldCheck size={18} />
                            <span>Transparent bookings. Smarter transportation.</span>
                        </div>
                    </div>

                    <div className="hero-visual">
                        <div className="visual-card">
                            <div className="visual-top">
                                <span>SMART FREIGHT NETWORK</span>
                                <span className="live-indicator">● LIVE</span>
                            </div>

                            <div className="route-visual">
                                <div className="route-point">
                                    <span className="route-marker origin"></span>
                                    <div>
                                        <small>ORIGIN</small>
                                        <strong>Ahmedabad</strong>
                                    </div>
                                </div>

                                <div className="route-line">
                                    <span className="route-truck">
                                        <Truck size={23} />
                                    </span>
                                </div>

                                <div className="route-point">
                                    <span className="route-marker destination"></span>
                                    <div>
                                        <small>DESTINATION</small>
                                        <strong>Delhi</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="capacity-card">
                                <div className="capacity-heading">
                                    <span>Available truck capacity</span>
                                    <Package size={20} />
                                </div>
                                <strong>4,000 <small>kg</small></strong>
                                <div className="capacity-track">
                                    <div></div>
                                </div>
                                <span className="capacity-note">
                                    Example available capacity
                                </span>
                            </div>

                            <div className="visual-bottom">
                                <div>
                                    <small>SMART MATCHING</small>
                                    <strong>Route-based freight</strong>
                                </div>
                                <Route size={28} />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="services section" id="services">
                    <div className="section-heading">
                        <span className="section-label">OUR SERVICES</span>
                        <h2>One platform. Multiple ways to move.</h2>
                        <p>
                            Whether you need an entire truck or just a little
                            space, SmartHaul connects your transportation needs.
                        </p>
                    </div>

                    <div className="service-grid">
                        <article className="service-card">
                            <div className="service-icon blue">
                                <Package size={26} />
                            </div>
                            <h3>Send Goods</h3>
                            <p>
                                Book transportation for your goods and discover
                                suitable trucks for your route.
                            </p>
                            <Link to="/register">
                                Start shipping <ArrowUpRight size={17} />
                            </Link>
                        </article>

                        <article className="service-card">
                            <div className="service-icon purple">
                                <Truck size={26} />
                            </div>
                            <h3>Truck Owners</h3>
                            <p>
                                Publish your truck routes, manage bookings and
                                earn from unused vehicle capacity.
                            </p>
                            <Link to="/register">
                                Join as owner <ArrowUpRight size={17} />
                            </Link>
                        </article>

                        <article className="service-card">
                            <div className="service-icon green">
                                <Building2 size={26} />
                            </div>
                            <h3>Logistics Companies</h3>
                            <p>
                                Manage your fleet, drivers, routes and freight
                                operations from one platform.
                            </p>
                            <Link to="/register">
                                Join as company <ArrowUpRight size={17} />
                            </Link>
                        </article>
                    </div>
                </section>

                <section className="how-section section" id="how-it-works">
                    <div className="section-heading">
                        <span className="section-label">HOW IT WORKS</span>
                        <h2>Make every journey count.</h2>
                        <p>
                            Our route-based matching system helps connect
                            shipments with trucks already travelling nearby.
                        </p>
                    </div>

                    <div className="steps-grid">
                        <div className="step-card">
                            <span className="step-number">01</span>
                            <MapPin size={25} />
                            <h3>Enter Your Route</h3>
                            <p>
                                Add your pickup location, delivery destination
                                and shipment details.
                            </p>
                        </div>

                        <div className="step-card">
                            <span className="step-number">02</span>
                            <Route size={25} />
                            <h3>Find Smart Matches</h3>
                            <p>
                                Discover full trucks or available capacity on
                                compatible existing routes.
                            </p>
                        </div>

                        <div className="step-card">
                            <span className="step-number">03</span>
                            <Clock size={25} />
                            <h3>Book and Track</h3>
                            <p>
                                Confirm your booking and follow shipment
                                progress through tracking updates.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="about-section section" id="about">
                    <div>
                        <span className="section-label">WHY SMARTHAUL</span>
                        <h2>Don't let empty truck space go to waste.</h2>
                        <p>
                            SmartHaul aims to make freight transportation more
                            efficient by matching smaller shipments with
                            available capacity on existing truck routes.
                        </p>
                    </div>

                    <Link to="/register" className="primary-button">
                        Join SmartHaul <ArrowRight size={18} />
                    </Link>
                </section>
            </main>

            <footer className="footer">
                <Link to="/" className="brand">
                    <Truck size={23} />
                    Smart<span className="brand-highlight">Haul</span>
                </Link>
                <p>Smarter freight. Better journeys.</p>
                <span>© 2026 SmartHaul. All rights reserved.</span>
            </footer>
        </>
    );
}

export default Home;
