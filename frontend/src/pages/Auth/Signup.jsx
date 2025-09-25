import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { signupUser } from "../../features/auth/authSlice";

// Yup validation schema
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

const Signup = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const securityQuestions = [
    "What is your mother's maiden name?",
    "What was the name of your first pet?",
    "What city were you born in?",
    "What is your favorite teacher's name?",
  ];

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>

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
          onSubmit={(values) => {
            // remove confirmPassword before sending
            const { confirmPassword, ...payload } = values;
            dispatch(signupUser(payload));
          }}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-3">
              {/* Full Name */}
              <div>
                <Field
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  className="w-full p-2 border rounded"
                />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              {/* Email */}
              <div>
                <Field
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="w-full p-2 border rounded"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              {/* Phone */}
              <div>
                <Field
                  type="text"
                  name="phone_number"
                  placeholder="Phone Number"
                  className="w-full p-2 border rounded"
                />
                <ErrorMessage
                  name="phone_number"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              {/* Password */}
              <div>
                <Field
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="w-full p-2 border rounded"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <Field
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  className="w-full p-2 border rounded"
                />
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              {/* Role */}
              <div>
                <Field
                  as="select"
                  name="role"
                  className="w-full p-2 border rounded"
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </Field>
                <ErrorMessage
                  name="role"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              {/* Security Question */}
              <div>
                <Field
                  as="select"
                  name="security_question"
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select a security question</option>
                  {securityQuestions.map((q, idx) => (
                    <option key={idx} value={q}>
                      {q}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  name="security_question"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              {/* Security Answer */}
              <div>
                <Field
                  type="text"
                  name="security_answer"
                  placeholder="Your Answer"
                  className="w-full p-2 border rounded"
                />
                <ErrorMessage
                  name="security_answer"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              {/* Error Message */}
              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || isSubmitting}
                className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Signing up..." : "Sign Up"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Signup;
