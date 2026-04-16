const TOKEN_KEY = "token";
const BASE_URL = "http://localhost:3000/api/v1";

// Ensure no trailing slash
const normalizeBaseUrl = (url) => url.replace(/\/+$/, "");

// Build full API URL
const buildUrl = (path) => {
  const baseUrl = normalizeBaseUrl(BASE_URL);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  
  const fullUrl = `${baseUrl}${normalizedPath}`;
  console.log("API CALL:", fullUrl); // 🔥 helpful for debugging

  return fullUrl;
};

// ================= TOKEN HANDLING =================

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const clearAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

// ================= ERROR HANDLING =================

const createError = (message, status, data) => {
  const error = new Error(message);
  error.response = { data, status };
  return error;
};

const extractTextErrorMessage = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  const preTagMatch = value.match(/<pre>(.*?)<\/pre>/is);
  const extractedMessage = preTagMatch?.[1] || value;
  const normalizedMessage = extractedMessage.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  if (/Cannot (GET|POST|PATCH|DELETE) \/api\/v1\/tasks/i.test(normalizedMessage)) {
    return "Task API route is unavailable. Restart the backend server and try again.";
  }

  return normalizedMessage;
};

// ================= CORE REQUEST FUNCTION =================

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
          body:
            isFormData || typeof body === "string"
              ? body
              : JSON.stringify(body),
        }),
    ...restOptions,
  });

  // Handle empty response
  if (response.status === 204) {
    return { data: null, status: response.status };
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  // Handle errors
  if (!response.ok) {
    const message =
      (typeof data === "object" && (data?.message || data?.error)) ||
      extractTextErrorMessage(data) ||
      `Request failed with status ${response.status}`;

    throw createError(message, response.status, data);
  }

  return { data, status: response.status };
}

// ================= API METHODS =================

const API = {
  get: (path, options = {}) =>
    request(path, { ...options, method: "GET" }),

  post: (path, body, options = {}) =>
    request(path, { ...options, method: "POST", body }),

  put: (path, body, options = {}) =>
    request(path, { ...options, method: "PUT", body }),

  patch: (path, body, options = {}) =>
    request(path, { ...options, method: "PATCH", body }),

  delete: (path, options = {}) =>
    request(path, { ...options, method: "DELETE" }),
};

export default API;
