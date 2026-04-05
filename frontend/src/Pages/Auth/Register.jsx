import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/Input";
import registerbg from "../../assets/register-bg.png";
import { getLastProtectedRoute } from "../../api/auth";
import { register } from "../../store/authSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
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
    if (!form.name) newErrors.name = "*Name is required";
    if (!form.email) newErrors.email = "*Email is required";
    if (!form.password) newErrors.password = "*Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setStatusMessage("Please fill in all required fields.");
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
        navigate(getLastProtectedRoute(), { replace: true });
      } else {
        setStatusMessage("Registration succeeded. Please log in.");
        navigate("/login", { replace: true });
      }
    } catch (error) {
      console.error("Registration error:", error);

      const message =
        error.message ||
        "Registration failed. Please try again.";

      setStatusMessage(message);
    }
  };

  return (
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

          <button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <div className="auth-links">
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
