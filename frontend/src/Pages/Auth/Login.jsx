import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/Input";
import loginBg from "../../assets/login-bg.png";
import { getLastProtectedRoute } from "../../api/auth";
import { login } from "../../store/authSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getAuthErrorMessage, isValidEmail } from "../../utils/authMessages";
import "../../styles/auth.css";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [form, setForm] = useState({ email: "", password: "" });
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
    if (!form.email) {
      newErrors.email = "*Email is required";
    } else if (!isValidEmail(form.email)) {
      newErrors.email = "*Enter a valid email address";
    }

    if (!form.password) {
      newErrors.password = "*Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const validationMessage = !form.email
        ? "Please enter your email address."
        : !isValidEmail(form.email)
          ? "Please enter a valid email address."
          : "Please enter your password.";
      setStatusMessage(validationMessage);
      alert(validationMessage);
      return;
    }

    try {
      setStatusMessage("");
      const data = await dispatch(login(form)).unwrap();
      const token = data?.token;

      if (!token) {
        setStatusMessage("User not registered. Please register first.");
        alert("User not registered. Please register first.");
        return;
      }

      alert("Login successful.");
      navigate(getLastProtectedRoute(), { replace: true });
    } catch (error) {
      const message = getAuthErrorMessage("login", error);
      setStatusMessage(message);
      alert(message);
      console.error("Login error:", error);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-container">
        <div className="auth-left">
          <img src={loginBg} alt="Login Preview" className="loginbg" />
        </div>

        <div className="auth-right">
          <h1 className="text-4xl ">Welcome Back!</h1>
          <h3 className="text-2xl text-gray-600">Login to your account</h3>
          <br/>

          <form onSubmit={handleSubmit}>
            <Input
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              error={errors.email}
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              error={errors.password}
              autoComplete="current-password"
            />

            {errors.general && <p style={{ color: "red" }}>{errors.general}</p>}
            {statusMessage && <p style={{ color: "red" }}>{statusMessage}</p>}

            <div className="auth-links">
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="auth-links">
            <p>
              Don&apos;t have an account? <Link to="/register">Register</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
