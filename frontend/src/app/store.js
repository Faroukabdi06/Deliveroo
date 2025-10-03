import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import customerReducer from "../features/customer/customerSlice";
import notificationReducer from "../features/notifications/notificationSlice";

// Preload auth state from localStorage
const preloadedState = {
  auth: {
    user: null,
    token: localStorage.getItem("token") || null,
    refreshToken: localStorage.getItem("refreshToken") || null,
    role: localStorage.getItem("role") || null,
    loading: false,
    error: null,
  },
};

const store = configureStore({
  reducer: {
    auth: authReducer,
    customer: customerReducer,
    notifications: notificationReducer,
  },
  preloadedState,
});

export default store;
