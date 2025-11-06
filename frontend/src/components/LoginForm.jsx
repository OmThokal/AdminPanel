import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { NavLink, useNavigate } from "react-router-dom";
import "./RegisterForm.css";

const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6, "At least 6 characters").required("Password is required"),
});

const LoginForm = ({ onLogin }) => {
  const navigate = useNavigate();

  return (
    <div className="form-container">
      <h2>Login</h2>
      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={LoginSchema}
        onSubmit={async (values, { resetForm }) => {
          try {
            const res = await axios.post("http://localhost:8080/api/login", values);
            alert("✅ Login successful!");
            localStorage.setItem("token", res.data.token);
            resetForm();
            if (onLogin) onLogin();
            navigate("/dashboard");
          } catch (err) {
            alert("❌ Error: " + (err.response?.data?.error || err.message));
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <div className="form-field">
              <Field type="email" name="email" placeholder="Enter email" />
              <ErrorMessage name="email" component="div" className="error" />
            </div>

            <div className="form-field">
              <Field type="password" name="password" placeholder="Enter password" />
              <ErrorMessage name="password" component="div" className="error" />
            </div>

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Login"}
            </button>

            <div className="login-redirect">
              <p>Don’t have an account?</p>
              <NavLink to="/register" className="login-btn">
                Register
              </NavLink>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default LoginForm;
