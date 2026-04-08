import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/Input";
import Button from "../../components/Button";
import registerbg from "../../assets/register-bg.png";
import { getLastProtectedRoute } from "../../api/auth";
import { register } from "../../store/authSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getAuthErrorMessage, isValidEmail } from "../../utils/authMessages";
import "../../styles/auth.css";

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState("");
  const loading = useAppSelector((state) => state.auth.loading);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!form.name.trim()) {
      newErrors.name = "*Name is required";
    }

    if (!form.email) {
      newErrors.email = "*Email is required";
    } else if (!isValidEmail(form.email)) {
      newErrors.email = "*Enter a valid email address";
    }

    if (!form.password) {
      newErrors.password = "*Password is required";
    } else if (form.password.length < 8) {
      newErrors.password = "*Password must be at least 8 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const validationMessage = !form.name.trim()
        ? "Please enter your full name."
        : !form.email
          ? "Please enter your email address."
          : !isValidEmail(form.email)
            ? "Please enter a valid email address."
            : !form.password
              ? "Please create a password."
              : "Password must be at least 8 characters long.";
      setStatusMessage(validationMessage);
    
      return;
    }

    setStatusMessage("");

    try {
      const data = await dispatch(register({
        name: form.name,
        email: form.email,
        password: form.password,
        avatar: "https://i.pravatar.cc/150?img=3",
      })).unwrap();

      const token = data?.token;

      if (token) {
        alert("Your account has been created successfully.");
        navigate(getLastProtectedRoute(), { replace: true });
      } else {
        setStatusMessage("Your account was created. Please log in to continue.");
        alert("Registartion success! Please log in to continue.");
        navigate("/login", { replace: true });
      }
    } catch (error) {
      console.error("Registration error:", error);
      const message = getAuthErrorMessage("register", error);
      setStatusMessage(message);
      alert(message);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-container">
        <div className="auth-left">
          <img src={registerbg} alt="Register Preview" className="registerbg" />
        </div>
        

        <div className="auth-right">
          <h1 className="text-4xl">Register</h1>
          <h3 className="text-2xl text-gray-600">Create your account</h3>
          <br/>  
          <form onSubmit={handleSubmit}>
            <Input
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your name"
              error={errors.name}
            />

            <Input
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              error={errors.email}
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              error={errors.password}
            />

            {statusMessage && <p style={{ color: "red" }}>{statusMessage}</p>}

            <Button type="submit" disabled={loading} className="w-full rounded-xl">
              {loading ? "Registering..." : "Register"}
            </Button>
          </form>

          <div className="auth-links">
            <p>
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
