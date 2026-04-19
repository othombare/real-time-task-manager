import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import presenceReducer from "./presenceSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    presence: presenceReducer,
  },
});
