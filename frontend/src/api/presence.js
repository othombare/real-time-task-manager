import API from "./axios";

const normalizeApiError = (error, fallbackMessage) => {
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallbackMessage;

  const normalizedError = new Error(message);
  normalizedError.response = error?.response;
  normalizedError.status = error?.response?.status || error?.status;
  normalizedError.data = error?.response?.data;
  return normalizedError;
};

export const getPresence = async () => {
  try {
    return await API.get("/presence", { auth: true });
  } catch (error) {
    throw normalizeApiError(error, "Unable to fetch user presence.");
  }
};
