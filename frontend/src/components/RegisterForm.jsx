import { NavLink, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import "./RegisterForm.css";

const RegisterSchema = Yup.object().shape({
  name: Yup.string().min(3, "Name too short!").max(20, "Name too long!").required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(6, "At least 6 characters").required("Password is required"),
});

const RegisterForm = () => {
  const navigate = useNavigate();
  return (
    <div className="form-page">
      <div className="form-container">
        <h2>Register</h2>
        <Formik
          initialValues={{ name: "", email: "", password: "" }}
          validationSchema={RegisterSchema}
          onSubmit={async (values, { resetForm }) => {
            try {
              const res = await axios.post("http://localhost:8080/api/register", values);
              alert("✅ User registered successfully!");
              resetForm();
              navigate("/login");
            } catch (err) {
              alert("❌ Error: " + (err.response?.data?.error || err.message));
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="form-field">
                <Field type="text" name="name" placeholder="Enter name" />
                <ErrorMessage name="name" component="div" className="error" />
              </div>

              <div className="form-field">
                <Field type="email" name="email" placeholder="Enter email" />
                <ErrorMessage name="email" component="div" className="error" />
              </div>

              <div className="form-field">
                <Field type="password" name="password" placeholder="Enter password" />
                <ErrorMessage name="password" component="div" className="error" />
              </div>

              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Register"}
              </button>

              <div className="login-redirect">
                <p>Already have an account?</p>
                <NavLink to="/login" className="login-btn">
                  Login
                </NavLink>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default RegisterForm;
