import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getPresence } from "../api/presence";

const normalizeLastSeen = (value) => {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString();
};

const normalizePresenceEntry = (payload) => {
  const userId = String(payload?.userId || payload?._id || "").trim();

  if (!userId) {
    return null;
  }

  const status = String(payload?.status || "").toLowerCase() === "online" ? "online" : "offline";

  return {
    userId,
    status,
    lastSeen: status === "offline" ? normalizeLastSeen(payload?.lastSeen) : null,
  };
};

const toPresenceMap = (presenceList = []) =>
  presenceList.reduce((map, item) => {
    const normalizedEntry = normalizePresenceEntry(item);

    if (normalizedEntry) {
      map[normalizedEntry.userId] = normalizedEntry;
    }

    return map;
  }, {});

export const fetchPresenceSnapshot = createAsyncThunk(
  "presence/fetchPresenceSnapshot",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getPresence();
      const presenceList = Array.isArray(response?.data?.data?.presence)
        ? response.data.data.presence
        : [];

      return presenceList;
    } catch (error) {
      return rejectWithValue(error.message || "Unable to load presence.");
    }
  }
);

const presenceSlice = createSlice({
  name: "presence",
  initialState: {
    byUserId: {},
    loading: false,
    initialized: false,
    error: null,
  },
  reducers: {
    presenceUpdated: (state, action) => {
      const normalizedEntry = normalizePresenceEntry(action.payload);

      if (!normalizedEntry) {
        return;
      }

      state.byUserId[normalizedEntry.userId] = {
        ...(state.byUserId[normalizedEntry.userId] || {}),
        ...normalizedEntry,
      };
    },
    clearPresenceState: (state) => {
      state.byUserId = {};
      state.loading = false;
      state.initialized = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPresenceSnapshot.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPresenceSnapshot.fulfilled, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.byUserId = toPresenceMap(action.payload);
        state.error = null;
      })
      .addCase(fetchPresenceSnapshot.rejected, (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.error = action.payload ?? action.error.message ?? null;
      });
  },
});

export const selectPresenceByUserId = (state, userId) => {
  const normalizedUserId = String(userId || "").trim();

  if (!normalizedUserId) {
    return {
      status: "offline",
      lastSeen: null,
    };
  }

  return (
    state.presence.byUserId[normalizedUserId] || {
      status: "offline",
      lastSeen: null,
    }
  );
};

export const selectPresenceMap = (state) => state.presence.byUserId;

export const { presenceUpdated, clearPresenceState } = presenceSlice.actions;
export default presenceSlice.reducer;
