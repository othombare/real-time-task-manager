import API from "../api/axios";

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

const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

export const getTasks = async (params = {}) => {
  try {
    return await API.get(`/tasks${buildQueryString(params)}`, { auth: true });
  } catch (error) {
    throw normalizeApiError(error, "Unable to fetch tasks.");
  }
};

export const createTask = async (task) => {
  try {
    return await API.post("/tasks", task, { auth: true });
  } catch (error) {
    throw normalizeApiError(error, "Unable to create task.");
  }
};

export const updateTask = async (taskId, updates) => {
  try {
    return await API.patch(`/tasks/${taskId}`, updates, { auth: true });
  } catch (error) {
    throw normalizeApiError(error, "Unable to update task.");
  }
};

export const deleteTask = async (taskId) => {
  try {
    return await API.delete(`/tasks/${taskId}`, { auth: true });
  } catch (error) {
    throw normalizeApiError(error, "Unable to delete task.");
  }
};

export const addTaskComment = async (taskId, text) => {
  try {
    return await API.post(`/tasks/${taskId}/comments`, { text }, { auth: true });
  } catch (error) {
    throw normalizeApiError(error, "Unable to add task comment.");
  }
};

export const addTaskAttachments = async (taskId, attachments) => {
  try {
    return await API.post(`/tasks/${taskId}/attachments`, { attachments }, { auth: true });
  } catch (error) {
    throw normalizeApiError(error, "Unable to add task attachments.");
  }
};
