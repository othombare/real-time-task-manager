import { useState } from "react";
import Input from "../components/Input";
import { Link } from "react-router-dom";

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Validation
  const validate = () => {
    let newErrors = {};

    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    }

    return newErrors;
  };

  // Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);

    setTimeout(() => {
      console.log("Login Data:", form);
      setLoading(false);
    }, 2000);
  };

 
  return (
  <div className="auth-container">
    
    {/* LEFT SIDE */}
    <div className="auth-left">
      <h2>Project preview</h2>
      <p>Task Manager</p>
      <img src="/preview.png" alt="preview" />
    </div>

    {/* RIGHT SIDE */}
    <div className="auth-right">
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <Input
          label="Email"
          type="email"
          name="email"
          value={form.email}
          placeholder="Enter your email"
          onChange={handleChange}
          error={errors.email}
        />

        <Input
          label="Password"
          type="password"
          name="password"
          value={form.password}
          placeholder="Enter your password"
          onChange={handleChange}
          error={errors.password}
        />

          <Link to="/forgot-password">Forgot Password?</Link>
        <button type="submit">
          {loading ? "Logging in..." : "Sign In"}
        </button>
      </form>

      <p>
        Don’t have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  </div>
);
}

export default Login;