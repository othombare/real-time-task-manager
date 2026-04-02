import { useState } from "react";
import { Link } from "react-router-dom";
import Input from "../../components/Input";
import img from "../../assets/forgotpass-bg.png";
import { requestPasswordReset } from "../../api/auth";
import "../../styles/auth.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setMessage("Please enter your email");
      return;
    }

    try {
      setLoading(true);
      setMessage("Sending reset link...");
      await requestPasswordReset(email);
      setMessage("Password reset link sent to your email.");
    } catch (error) {
      setMessage(error.message || "Unable to send reset link right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-left">
        <img src={img} alt="Forgot Password" className="forgot-password-bg" />
      </div>

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

          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {message && (
          <p style={{ marginTop: "10px", color: message.includes("Please") ? "red" : "green" }}>
            {message}
          </p>
        )}

        <div className="auth-links">
          <p>
            Remember your password? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
