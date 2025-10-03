import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { signupUser, loginUser } from "../features/auth/authSlice";
import { Navigate, useNavigate } from "react-router-dom";
import "../styles/AuthPage.css";
import deliveryImage from "../assets/delivery.jpeg";

// Validation schemas
const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

const SignupSchema = Yup.object().shape({
  name: Yup.string().required("Full name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone_number: Yup.string()
    .matches(/^[0-9]+$/, "Phone number must only contain digits")
    .required("Phone number is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm password is required"),
  role: Yup.string().required("Role is required"),
  security_question: Yup.string().required("Security question is required"),
  security_answer: Yup.string().required("Security answer is required"),
});

function AuthPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, role, loading, error } = useSelector((state) => state.auth);

  if (token && role) {
    if (role === "admin") return <Navigate to="/admin" replace />;
    if (role === "customer") return <Navigate to="/customer" replace />;
  }

  const securityQuestions = [
    "What is your mother's maiden name?",
    "What was the name of your first pet?",
    "What city were you born in?",
    "What is your favorite teacher's name?",
  ];

  return (
    <div className="auth-container">
      {/* Back button */}
      <button className="back-btn" onClick={() => navigate("/")}>
        &larr; Back
      </button>

      <div className={`auth-wrapper ${isSignup ? "right-panel-active" : ""}`}>
        {/* Login Form */}
        <div className="form-container sign-in-container">
          {successMessage && <p className="form-success text-center">{successMessage}</p>}
          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={LoginSchema}
            onSubmit={async (values, { setSubmitting }) => {
              const resultAction = await dispatch(loginUser(values));
              if (loginUser.fulfilled.match(resultAction)) {
                setSuccessMessage("Login successful!");
                setTimeout(() => setSuccessMessage(""), 3000); // hide after 3s
              }
              setSubmitting(false);
            }}
          >
            {({ isSubmitting }) => (
              <Form className="auth-form">
                <h2 className="form-title">Login</h2>

                <Field type="email" name="email" placeholder="Email" className="form-input" />
                <ErrorMessage name="email" component="div" className="form-error" />

                <Field type="password" name="password" placeholder="Password" className="form-input" />
                <ErrorMessage name="password" component="div" className="form-error" />

                {error && <p className="form-error text-center">{error}</p>}

                <button type="submit" disabled={loading || isSubmitting} className="form-btn">
                  {loading ? "Logging in..." : "Login"}
                </button>
              </Form>
            )}
          </Formik>
        </div>

        {/* Signup Form */}
        <div className="form-container sign-up-container">
          {successMessage && <p className="form-success text-center">{successMessage}</p>}
          <Formik
            initialValues={{
              name: "",
              email: "",
              phone_number: "",
              password: "",
              confirmPassword: "",
              role: "customer",
              security_question: "",
              security_answer: "",
            }}
            validationSchema={SignupSchema}
            onSubmit={async (values, { setSubmitting }) => {
              const { confirmPassword, ...payload } = values;
              const resultAction = await dispatch(signupUser(payload));
              if (signupUser.fulfilled.match(resultAction)) {
                setSuccessMessage("Signup successful! Please login.");
                setTimeout(() => setSuccessMessage(""), 3000);
                setIsSignup(false);
              }
              setSubmitting(false);
            }}
          >
            {({ isSubmitting }) => (
              <Form className="auth-form">
                <h2 className="form-title">Sign Up</h2>

                <Field type="text" name="name" placeholder="Full Name" className="form-input" />
                <ErrorMessage name="name" component="div" className="form-error" />

                <Field type="email" name="email" placeholder="Email" className="form-input" />
                <ErrorMessage name="email" component="div" className="form-error" />

                <Field type="text" name="phone_number" placeholder="Phone Number" className="form-input" />
                <ErrorMessage name="phone_number" component="div" className="form-error" />

                <Field type="password" name="password" placeholder="Password" className="form-input" />
                <ErrorMessage name="password" component="div" className="form-error" />

                <Field type="password" name="confirmPassword" placeholder="Confirm Password" className="form-input" />
                <ErrorMessage name="confirmPassword" component="div" className="form-error" />

                <Field as="select" name="role" className="form-input">
                  <option value="customer">Customer</option>
                </Field>

                <Field as="select" name="security_question" className="form-input">
                  <option value="">Select a security question</option>
                  {securityQuestions.map((q, idx) => (
                    <option key={idx} value={q}>
                      {q}
                    </option>
                  ))}
                </Field>
                <ErrorMessage name="security_question" component="div" className="form-error" />

                <Field type="text" name="security_answer" placeholder="Your Answer" className="form-input" />
                <ErrorMessage name="security_answer" component="div" className="form-error" />

                {error && <p className="form-error text-center">{error}</p>}

                <button type="submit" disabled={loading || isSubmitting} className="form-btn">
                  {loading ? "Signing up..." : "Sign Up"}
                </button>
              </Form>
            )}
          </Formik>
        </div>

        {/* Overlay with background image */}
        <div className="overlay-container">
          <div className="overlay" style={{ backgroundImage: `url(${deliveryImage})` }}>
            <div className="overlay-panel overlay-left">
              <h2>Welcome Back!</h2>
              <p>To keep connected, please login with your info</p>
              <button className="ghost-btn" onClick={() => setIsSignup(false)}>
                Login
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h2>Don't have an account!</h2>
              <p>Enter your details to start your journey</p>
              <button className="ghost-btn" onClick={() => setIsSignup(true)}>
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
