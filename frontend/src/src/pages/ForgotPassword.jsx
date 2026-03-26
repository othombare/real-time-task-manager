import { useState } from "react";
import Input from "../components/Input";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email) {
      setMessage("Please enter your email");
      return;
    }

    // simulate API call
    setTimeout(() => {
      setMessage("Password reset link sent to your email");
    }, 1500);
  };

  return (
    <div className="auth-container">

      {/* LEFT SIDE */}
      <div className="auth-left">
        <h2>Reset Access</h2>
        <p>We’ll help you get back into your account</p>
      </div>

      {/* RIGHT SIDE */}
      <div className="auth-right">
        <h2>Forgot Password</h2>

        <form onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your registered email"
          />

          <button type="submit">Send Reset Link</button>
        </form>

        {message && (
          <p style={{ marginTop: "10px", color: "green" }}>
            {message}
          </p>
        )}

        <p>
          Remember your password?{" "}
          <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;