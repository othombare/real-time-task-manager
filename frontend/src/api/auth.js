import API, { clearAuthToken, getAuthToken, setAuthToken } from "./axios";

const PROFILE_KEY = "currentUserProfile";

// ================= ERROR HANDLING =================

const normalizeApiError = (error, fallbackMessage) => {
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallbackMessage;

  return new Error(message);
};

// ================= PROFILE STORAGE =================

const setStoredProfile = (profile) => {
  if (profile) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }
};

export const getStoredProfile = () => {
  try {
    const storedProfile = localStorage.getItem(PROFILE_KEY);
    return storedProfile ? JSON.parse(storedProfile) : null;
  } catch {
    return null;
  }
};

// ================= LOGIN =================

export const loginUser = async ({ email, password }) => {
  try {
    const response = await API.post("/users/login", { email, password });

    const token = response.data.token;
    if (!token) {
      throw new Error("Token not received from server");
    }

    setAuthToken(token);

    // If your backend sends user data, store it
    if (response.data.data?.user) {
      setStoredProfile(response.data.data.user);
    }

    return response.data;
  } catch (error) {
    throw normalizeApiError(error, "Login failed. Please try again.");
  }
};

// ================= REGISTER =================

export const registerUser = async ({
  name,
  email,
  password,
  passwordConfirm,
}) => {
  try {
    const response = await API.post("/users/signup", {
      name,
      email,
      password,
      passwordConfirm : password,
    });

    const token = response.data.token;

    if (!token) {
      throw new Error("Registration succeeded but token not returned");
    }

    setAuthToken(token);

    // Store user if available
    if (response.data.data?.user) {
      setStoredProfile(response.data.data.user);
    }

    return response.data;
  } catch (error) {
    throw normalizeApiError(error, "Registration failed. Please try again.");
  }
};

// ================= PROFILE (OPTIONAL) =================

// Only use this IF you have a protected route like /users/me
export const getMyProfile = async () => {
  try {
    const response = await API.get("/users/me", { auth: true });
    console.log("getMyProfile response:", response);
    if (response.data.data?.user) {
      setStoredProfile(response.data.data.user);
    }
    return response.data;
  } catch (error) {
    console.error("getMyProfile error:", error);
    throw normalizeApiError(error, "Unable to load your profile.");
  }
};

// ================= LOGOUT =================

export const logoutUser = () => {
  clearAuthToken();
  localStorage.removeItem(PROFILE_KEY);
};

// ================= PASSWORD RESET =================

export const requestPasswordReset = async (email) => {
  if (!email) {
    throw new Error("Email is required for password reset.");
  }

  try {
    const response = await API.post("/users/forgotPassword", { email });
    return response.data;
  } catch (error) {
    throw normalizeApiError(error, "Unable to send reset link. Please try again.");
  }
};

// ================= AUTH CHECK =================

export const isAuthenticated = () => Boolean(getAuthToken());