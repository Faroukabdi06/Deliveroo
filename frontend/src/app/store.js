import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import parcelReducer from "../features/parcels/parcelSlice";
// import notificationReducer from "../features/notifications/notificationSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    parcels: parcelReducer,
    // notifications: notificationReducer,
  },
});

export default store;
