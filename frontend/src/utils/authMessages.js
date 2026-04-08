export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());

const normalizeMessage = (message) => String(message || "").toLowerCase();

export const getAuthErrorMessage = (context, error) => {
  const rawMessage =
    typeof error === "string" ? error : error?.message || "Something went wrong.";
  const message = normalizeMessage(rawMessage);

  if (message.includes("network") || message.includes("timeout")) {
    return "We couldn't reach the server. Please check your internet connection and try again.";
  }

  if (
    message.includes("invalid credentials") ||
    message.includes("incorrect email") ||
    message.includes("incorrect password") ||
    message.includes("unauthorized")
  ) {
    return "Invalid credentials. Please try again.";
  }

  if (
    message.includes("user not found") ||
    message.includes("not registered") ||
    message.includes("no user")
  ) {
    return context === "forgot-password"
      ? "We couldn't find an account with that email address."
      : "No account was found with that email address.";
  }

  if (
    message.includes("already exists") ||
    message.includes("already registered") ||
    message.includes("e11000 duplicate key error") ||
    message.includes("dup key") ||
    (message.includes("email_1") && message.includes("email"))
  ) {
    return "User with this email already exists. Please try using another email address.";
  }

  if (message.includes("passwords are not the same")) {
    return "Your password and confirmation password do not match.";
  }

  if (
    message.includes("token is invalid") ||
    message.includes("token has expired") ||
    message.includes("invalid token") ||
    message.includes("expired token")
  ) {
    return "This password reset link is invalid or has expired. Please request a new one.";
  }

  if (message.includes("too short") && message.includes("password")) {
    return "Password must be at least 8 characters long.";
  }

  if (message.includes("valid email")) {
    return "Please enter a valid email address.";
  }

  return rawMessage;
};
