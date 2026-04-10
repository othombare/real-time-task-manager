import API from "../api/axios";

const normalizeApiError = (error, fallbackMessage) => {
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallbackMessage;

  return new Error(message);
};

export const getProjects = async () => {
  try {
    return await API.get("/projects", { auth: true });
  } catch (error) {
    throw normalizeApiError(error, "Unable to fetch projects.");
  }
};

export const getProject = async (projectId) => {
  try {
    return await API.get(`/projects/${projectId}`, { auth: true });
  } catch (error) {
    throw normalizeApiError(error, "Unable to fetch project.");
  }
};

export const createProject = async ({ title, description }) => {
  try {
    return await API.post("/projects", { title, description }, { auth: true });
  } catch (error) {
    throw normalizeApiError(error, "Unable to create project.");
  }
};

export const updateProject = async (projectId, updates) => {
  try {
    return await API.patch(`/projects/${projectId}`, updates, { auth: true });
  } catch (error) {
    throw normalizeApiError(error, "Unable to update project.");
  }
};

export const deleteProject = async (projectId) => {
  try {
    return await API.delete(`/projects/${projectId}`, { auth: true });
  } catch (error) {
    throw normalizeApiError(error, "Unable to delete project.");
  }
};

export const joinProject = async (projectCode) => {
  try {
    return await API.post("/projects/join", { projectCode }, { auth: true });
  } catch (error) {
    throw normalizeApiError(error, "Unable to join project.");
  }
};

export const regenerateProjectCode = async (projectId) => {
  try {
    return await API.patch(`/projects/${projectId}/regenerate-code`, {}, { auth: true });
  } catch (error) {
    throw normalizeApiError(error, "Unable to regenerate project code.");
  }
};
