import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Input from "../../components/Input";
import img from "../../assets/forgotpass-bg.png";
import { getLastProtectedRoute } from "../../api/auth";
import { resetPasswordSession } from "../../store/authSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getAuthErrorMessage } from "../../utils/authMessages";
import "../../styles/auth.css";

const ResetPassword = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { token } = useParams();
  const [form, setForm] = useState({ password: "", passwordConfirm: "" });
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState("");
  const loading = useAppSelector((state) => state.auth.loading);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = {};

    if (!form.password) {
      nextErrors.password = "*Password is required";
    } else if (form.password.length < 8) {
      nextErrors.password = "*Password must be at least 8 characters";
    }

    if (!form.passwordConfirm) {
      nextErrors.passwordConfirm = "*Please confirm your password";
    }

    if (
      form.password &&
      form.passwordConfirm &&
      form.password !== form.passwordConfirm
    ) {
      nextErrors.passwordConfirm = "*Passwords do not match";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      const validationMessage = !form.password
        ? "Please enter your new password."
        : form.password.length < 8
          ? "Password must be at least 8 characters long."
          : !form.passwordConfirm
            ? "Please confirm your new password."
            : "Passwords do not match. Please enter the same password in both fields.";
      setStatusMessage(validationMessage);
      alert(validationMessage);
      return;
    }

    try {
      setStatusMessage("");
      await dispatch(resetPasswordSession({
        token,
        password: form.password,
        passwordConfirm: form.passwordConfirm,
      })).unwrap();
      alert("Your password has been reset successfully.");
      navigate(getLastProtectedRoute(), { replace: true });
    } catch (error) {
      const message = getAuthErrorMessage("reset-password", error);
      setStatusMessage(message);
      alert(message);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-container">
        <div className="auth-left">
          <img src={img} alt="Reset Password" className="forgot-password-bg" />
        </div>

        <div className="auth-right">
          <h2>Reset Password</h2>
          <p className="auth-subtitle">
            Create your new password below to regain access to your account.
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            <Input
              label="New Password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your new password"
              error={errors.password}
            />

            <Input
              label="Confirm Password"
              type="password"
              name="passwordConfirm"
              value={form.passwordConfirm}
              onChange={handleChange}
              placeholder="Re-enter your new password"
              error={errors.passwordConfirm}
            />

            {statusMessage && (
              <p className="auth-message error" style={{ marginTop: "10px" }}>
                {statusMessage}
              </p>
            )}

            <button type="submit" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          <div className="auth-links">
            <p>
              Back to <Link to="/login">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
