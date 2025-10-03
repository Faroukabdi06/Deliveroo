import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";
import { authApi } from "../../api/authApi";

// ------------------- Thunks -------------------

// Signup
export const signupUser = createAsyncThunk(
  "auth/signupUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/signup", userData);
      return response.data; // { success, msg }
    } catch (error) {
      return rejectWithValue(error.response?.data || { msg: "Signup failed" });
    }
  }
);

// Login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", credentials);
      const { access_token, refresh_token, role } = response.data;

      // Persist tokens and role
      localStorage.setItem("token", access_token);
      localStorage.setItem("refreshToken", refresh_token);
      localStorage.setItem("role", role);

      return {
        token: access_token,
        refreshToken: refresh_token,
        role,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || { msg: "Login failed" });
    }
  }
);

export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const refresh_token = localStorage.getItem("refreshToken");
      if (!refresh_token) throw new Error("No refresh token available");

      const response = await authApi.post(
        "/refresh",
        {},
        { headers: { Authorization: `Bearer ${refresh_token}` } }
      );

      const { access_token, role } = response.data;

      localStorage.setItem("token", access_token);
      localStorage.setItem("role", role);

      return { access_token, role };
    } catch (error) {
      // Clear all tokens if refresh fails
      dispatch(logout());
      return rejectWithValue(error.response?.data || { msg: "Token refresh failed" });
    }
  }
);
// Reset Password
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ email, security_answer, new_password }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post("/auth/reset-password", {
        email,
        security_answer,
        new_password,
      });

      if (response.data.success) {
        // Clear tokens after password reset
        dispatch(logout());
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { msg: "Password reset failed" });
    }
  }
);


// ------------------- Slice -------------------

const initialState = {
  user: null,
  token: localStorage.getItem("token") || null,
  refreshToken: localStorage.getItem("refreshToken") || null,
  role: localStorage.getItem("role") || null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.role = null;
      state.loading = false;
      state.error = null;
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("role");
    },
  },
  extraReducers: (builder) => {
    builder
      // Signup
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.msg || "Signup failed";
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.role = action.payload.role?.toLowerCase();
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.msg || "Login failed";
      })

      // Refresh
      .addCase(refreshToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.access_token;
        state.refreshToken = localStorage.getItem("refreshToken");
        state.role = action.payload.role?.toLowerCase();
      })

      .addCase(refreshToken.rejected, (state, action) => {
        state.loading = false;
        state.token = null;
        state.refreshToken = null;
        state.role = null;
        state.error = action.payload?.msg || "Token refresh failed";
      })

      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.msg || "Password reset failed";
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
