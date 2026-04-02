const TOKEN_KEY = "token";
const DEFAULT_BASE_URL = "https://api.escuelajs.co/api/v1";

const normalizeBaseUrl = (url) => (url || DEFAULT_BASE_URL).replace(/\/+$/, "");

const buildUrl = (path) => {
  const baseUrl = normalizeBaseUrl(import.meta.env.VITE_API_URL);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
};

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const clearAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

const createError = (message, status, data) => {
  const error = new Error(message);
  error.response = { data, status };
  return error;
};

async function request(path, options = {}) {
  const {
    auth = false,
    body,
    headers = {},
    method = "GET",
    ...restOptions
  } = options;

  const token = auth ? getAuthToken() : null;
  const isFormData = body instanceof FormData;

  const response = await fetch(buildUrl(path), {
    method,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body === undefined
      ? {}
      : {
          body: isFormData || typeof body === "string" ? body : JSON.stringify(body),
        }),
    ...restOptions,
  });

  if (response.status === 204) {
    return { data: null, status: response.status };
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      (typeof data === "object" && (data?.message || data?.error)) ||
      (typeof data === "string" && data) ||
      `Request failed with status ${response.status}`;

    throw createError(message, response.status, data);
  }

  return { data, status: response.status };
}

const API = {
  get: (path, options = {}) => request(path, { ...options, method: "GET" }),
  post: (path, body, options = {}) => request(path, { ...options, method: "POST", body }),
  put: (path, body, options = {}) => request(path, { ...options, method: "PUT", body }),
  patch: (path, body, options = {}) => request(path, { ...options, method: "PATCH", body }),
  delete: (path, options = {}) => request(path, { ...options, method: "DELETE" }),
};

export default API;
