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

export const getTodos = async () => {
  try {
    return await API.get("/todos", { auth: true });
  } catch (error) {
    throw normalizeApiError(error, "Unable to fetch todos.");
  }
};

export const createTodo = async (todoData) => {
  try {
    return await API.post("/todos", todoData, { auth: true });
  } catch (error) {
    throw normalizeApiError(error, "Unable to create todo.");
  }
};

export const updateTodo = async (todoId, updates) => {
  try {
    return await API.patch(`/todos/${todoId}`, updates, { auth: true });
  } catch (error) {
    throw normalizeApiError(error, "Unable to update todo.");
  }
};

export const deleteTodo = async (todoId) => {
  try {
    return await API.delete(`/todos/${todoId}`, { auth: true });
  } catch (error) {
    throw normalizeApiError(error, "Unable to delete todo.");
  }
};

export const clearCompletedTodos = async () => {
  try {
    return await API.delete("/todos/completed", { auth: true });
  } catch (error) {
    throw normalizeApiError(error, "Unable to clear completed todos.");
  }
};
