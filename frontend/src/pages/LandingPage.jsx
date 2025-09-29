import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "../styles/LandingPage.css";

import deliveryImg from "../assets/delivery.jpg";
import feature1 from "../assets/fast-delivery.jpg";
import feature2 from "../assets/safe-delivery.jpg";
import feature3 from "../assets/pay-delivery.jpg";

function LandingPage() {
  return (
    <div className="landing-container">
      {/* Navbar */}
      <header className="navbar">
        <h1 className="logo">Deliveroo</h1>
        <nav>
          <Link to="/Auth" className="nav-link">
            Login
          </Link>
          <Link to="/Auth" className="btn-primary">
            Sign Up
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <motion.section
        className="hero"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <div className="hero-text">
          <h2>
            Fast & Reliable <span className="highlight">Delivery</span>
          </h2>
          <p>
            Order for a delivery from the comfort of your home. Track your
            orders in real-time and enjoy quick deliveries.
          </p>
          <div className="hero-buttons">
            <Link to="/Auth" className="btn-primary">
              Get Started
            </Link>
            <Link to="/Auth" className="btn-outline">
              Login
            </Link>
          </div>
        </div>

        <motion.img
          src={deliveryImg}
          alt="Delivery"
          className="hero-img"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2 }}
        />
      </motion.section>

      {/* Features */}
      <section className="features">
        <h3>Why Choose Us?</h3>
        <div className="features-grid">
          <motion.div
            className="feature-card"
            style={{ backgroundImage: `url(${feature1})` }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="feature-card-content">
              <h4>Quick Delivery</h4>
              <p>
                Get your goods delivered in record time with real-time tracking.
              </p>
            </div>
          </motion.div>

          <motion.div
            className="feature-card"
            style={{ backgroundImage: `url(${feature2})` }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="feature-card-content">
              <h4>Secure Handling</h4>
              <p>
                Your packages are in safe hands with our trusted delivery team.
              </p>
            </div>
          </motion.div>

          <motion.div
            className="feature-card"
            style={{ backgroundImage: `url(${feature3})` }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="feature-card-content">
              <h4>Easy Payments</h4>
              <p>
                Secure and convenient payment options for a hassle-free
                experience.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <h4>Ready for your goods to be delivered?</h4>
        <Link to="/Auth" className="btn-secondary">
          Sign Up Now
        </Link>
        <p>© {new Date().getFullYear()} Deliveroo. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default LandingPage;