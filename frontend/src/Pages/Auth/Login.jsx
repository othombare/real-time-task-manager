import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/Input";
import loginBg from "../../assets/login-bg.png";
import { loginUser } from "../../api/auth";
import "../../styles/auth.css";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const newErrors = {};
    if (!form.email) newErrors.email = "*Email is required";
    if (!form.password) newErrors.password = "*Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setStatusMessage("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      setStatusMessage("");
      const data = await loginUser(form);
      const token = data?.access_token || data?.token;

      if (!token) {
        setStatusMessage("User not registered. Please register first.");
        setLoading(false);
        return;
      }

      navigate("/dashboard", { replace: true });
    } catch (error) {
      const status = error.message.toLowerCase();

      if (status.includes("unauthorized") || status.includes("invalid credentials")) {
        setStatusMessage("Invalid credentials. Please check your password.");
      } else if (status.includes("not registered")) {
        setStatusMessage("User not registered. Please register first.");
      } else {
        setStatusMessage("Server error. Try again later.");
      }

      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
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
  );
};

export default Login;
