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

export const removeProjectMember = async (projectId, memberId) => {
  try {
    return await API.delete(`/projects/${projectId}/members/${memberId}`, { auth: true });
  } catch (error) {
    throw normalizeApiError(error, "Unable to remove project member.");
  }
};

export const addProjectAttachments = async (projectId, attachments) => {
  try {
    return await API.post(`/projects/${projectId}/attachments`, { attachments }, { auth: true });
  } catch (error) {
    throw normalizeApiError(error, "Unable to add project attachments.");
  }
};

export const deleteProjectAttachment = async (projectId, attachmentId) => {
  try {
    return await API.delete(`/projects/${projectId}/attachments/${attachmentId}`, { auth: true });
  } catch (error) {
    throw normalizeApiError(error, "Unable to delete project attachment.");
  }
};

export const regenerateProjectCode = async (projectId) => {
  try {
    return await API.patch(`/projects/${projectId}/regenerate-code`, {}, { auth: true });
  } catch (error) {
    throw normalizeApiError(error, "Unable to regenerate project code.");
  }
};
