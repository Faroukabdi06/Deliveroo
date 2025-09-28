import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { loginUser } from "../../features/auth/authSlice";
import { useNavigate } from "react-router-dom";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, role, token } = useSelector((state) => state.auth);

  // 👇 Whenever token/role changes, redirect user
  useEffect(() => {
    if (token && role === "CUSTOMER") {
      navigate("/dashboard");
    }
    if (token && role === "ADMIN") {
      navigate("/dashboard/admin");
    }
  }, [token, role, navigate]);

  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Email required"),
    password: Yup.string().required("Password required"),
  });

  return (
    <div className="login-container">
      <h2>Login</h2>

      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting }) => {
          // 👇 Save the dispatched result
          const result = await dispatch(loginUser(values));

          console.log("Login result payload:", result.payload);

          setSubmitting(false);
        }}
      >
        {({ isSubmitting }) => (
          <Form className="login-form">
            <div>
              <label>Email</label>
              <Field type="email" name="email" />
              <ErrorMessage name="email" component="div" className="error" />
            </div>

            <div>
              <label>Password</label>
              <Field type="password" name="password" />
              <ErrorMessage name="password" component="div" className="error" />
            </div>

            {error && <div className="error">{error}</div>}

            <button type="submit" disabled={isSubmitting || loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default Login;
