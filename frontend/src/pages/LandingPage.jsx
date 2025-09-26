import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "../styles/landingPage.css"

// import deliveryImg from "../assets/delivery.png";
// import feature1 from "../assets/feature1.png";
// import feature2 from "../assets/feature2.png";
// import feature3 from "../assets/feature3.png";

function LandingPage() {
  return (
    <div className="landing-container">
      {/* Navbar */}
      <header className="navbar">
        <h1 className="logo">Deliveroo</h1>
        <nav>
          <Link to="/login" className="nav-link">Login</Link>
          <Link to="/signup" className="btn-primary">Sign Up</Link>
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
            Fast & Reliable <span className="highlight"> Delivery</span>
          </h2>
          <p>
            Order for a delivery from the comfort of your home.
            Track your orders in real-time and enjoy quick deliveries.
          </p>
          <div className="hero-buttons">
            <Link to="/signup" className="btn-primary">Get Started</Link>
            <Link to="/login" className="btn-outline">Login</Link>
          </div>
        </div>

        <motion.img
          src={"deliveryImg"}
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
          <motion.div className="feature-card" whileHover={{ scale: 1.05 }}>
            <img src={"feature1"} alt="Feature 1" />
            <h4>Quick Delivery</h4>
            <p>Get your goods delivered in record time with real-time tracking.</p>
          </motion.div>

          <motion.div className="feature-card" whileHover={{ scale: 1.05 }}>
            <img src={"feature2"} alt="Feature 2" />
            <h4>Wide Variety</h4>
            <p>We deliver a variety of goods from small food orders to large container oders.</p>
          </motion.div>

          <motion.div className="feature-card" whileHover={{ scale: 1.05 }}>
            <img src={"feature3"} alt="Feature 3" />
            <h4>Easy Payments</h4>
            <p>Secure and convenient payment options for a hassle-free experience.</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <h4>Ready for your goods to be delivered?</h4>
        <Link to="/signup" className="btn-secondary">Sign Up Now</Link>
        <p>© {new Date().getFullYear()} Deliveroo. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default LandingPage;
