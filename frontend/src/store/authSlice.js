import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getAuthToken } from "../api/axios";
import {
  getMyProfile,
  getStoredProfile,
  isAuthenticated,
  loginUser as loginRequest,
  logoutUser as logoutRequest,
  registerUser as registerRequest,
  resetPassword as resetPasswordRequest,
} from "../api/auth";

const getInitialUser = () => getStoredProfile();
const getInitialToken = () => getAuthToken();

export const initializeAuth = createAsyncThunk(
  "auth/initializeAuth",
  async (_, { rejectWithValue }) => {
    if (!isAuthenticated()) {
      return {
        token: null,
        user: null,
      };
    }

    try {
      const response = await getMyProfile();

      return {
        token: getAuthToken(),
        user: response.data?.user ?? null,
      };
    } catch (error) {
      return rejectWithValue(
        error.message || "Unable to restore your session."
      );
    }
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await loginRequest(credentials);

      return {
        token: response.token ?? null,
        user: response.data?.user ?? null,
      };
    } catch (error) {
      return rejectWithValue(error.message || "Login failed.");
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await registerRequest(payload);

      return {
        token: response.token ?? null,
        user: response.data?.user ?? null,
      };
    } catch (error) {
      return rejectWithValue(error.message || "Registration failed.");
    }
  }
);

export const resetPasswordSession = createAsyncThunk(
  "auth/resetPasswordSession",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await resetPasswordRequest(payload);

      return {
        token: response.token ?? null,
        user: response.data?.user ?? null,
      };
    } catch (error) {
      return rejectWithValue(error.message || "Unable to reset password.");
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  logoutRequest();
  return null;
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: getInitialUser(),
    token: getInitialToken(),
    loading: isAuthenticated() && !getInitialUser(),
    initialized: !isAuthenticated() || Boolean(getInitialUser()),
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.token = getAuthToken();
        state.user = null;
        state.error = action.payload ?? action.error.message ?? null;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? action.error.message ?? null;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? action.error.message ?? null;
      })
      .addCase(resetPasswordSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPasswordSession.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(resetPasswordSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? action.error.message ?? null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.initialized = true;
        state.token = null;
        state.user = null;
        state.error = null;
      });
  },
});

export default authSlice.reducer;
