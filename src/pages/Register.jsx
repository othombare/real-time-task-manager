import { useState } from "react";
import Input from "../components/Input";
import { Link } from "react-router-dom";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Register Data:", form);
  };

  return (
    <div className="auth-container">
      
      {/* LEFT SIDE SAME */}
      <div className="auth-left">
        <h2>Project preview</h2>
        <p>Task Manager</p>
        <img src="/preview.png" alt="preview" />
      </div>

      {/* RIGHT SIDE (CHANGED) */}
      <div className="auth-right">
        <h2>Register</h2>

        <form onSubmit={handleSubmit}>
          <Input
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter your name"
          />

          <Input
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter your email"
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
          />

          <button type="submit">Sign Up</button>
        </form>

        <p>
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;