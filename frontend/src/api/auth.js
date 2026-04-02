import API, { clearAuthToken, getAuthToken, setAuthToken } from "./axios";

const PROFILE_KEY = "currentUserProfile";

const getTokenFromResponse = (data) =>
  data?.access_token || data?.token || data?.data?.access_token || data?.data?.token;

const normalizeApiError = (error, fallbackMessage) => {
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallbackMessage;

  return new Error(message);
};

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

export const loginUser = async ({ email, password }) => {
  try {
    const response = await API.post("/auth/login", { email, password });
    const token = getTokenFromResponse(response.data);

    if (!token) {
      throw new Error("Token not received from server");
    }

    setAuthToken(token);
    const profileResponse = await API.get("/auth/profile", { auth: true });
    setStoredProfile(profileResponse.data);

    return { ...response.data, profile: profileResponse.data };
  } catch (error) {
    throw normalizeApiError(error, "Login failed. Please try again.");
  }
};

export const registerUser = async ({ name, email, password, avatar }) => {
  try {
    await API.post("/users/", {
      name,
      email,
      password,
      avatar,
    });

    const loginResponse = await API.post("/auth/login", { email, password });
    const token = getTokenFromResponse(loginResponse.data);

    if (!token) {
      throw new Error("Registration succeeded but login token was not returned");
    }

    setAuthToken(token);
    const profileResponse = await API.get("/auth/profile", { auth: true });
    setStoredProfile(profileResponse.data);

    return { ...loginResponse.data, profile: profileResponse.data };
  } catch (error) {
    throw normalizeApiError(error, "Registration failed. Please try again.");
  }
};

export const requestPasswordReset = async (email) => {
  try {
    const response = await API.post("/auth/forgot-password", { email });
    return response.data;
  } catch (error) {
    throw normalizeApiError(error, "Unable to send reset link right now.");
  }
};

export const getMyProfile = async () => {
  try {
    const response = await API.get("/auth/profile", { auth: true });
    setStoredProfile(response.data);
    return response.data;
  } catch (error) {
    throw normalizeApiError(error, "Unable to load your profile right now.");
  }
};

export const logoutUser = () => {
  clearAuthToken();
  localStorage.removeItem(PROFILE_KEY);
};

export const isAuthenticated = () => Boolean(getAuthToken());
