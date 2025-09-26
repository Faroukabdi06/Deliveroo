import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import adminReducer from "../features/admin/adminSlice";
import customerReducer from "../features/customer/customerSlice";
import notificationReducer from "../features/notification/notificationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
    customer: customerReducer,
    notifications: notificationReducer,
  },
});
export default store