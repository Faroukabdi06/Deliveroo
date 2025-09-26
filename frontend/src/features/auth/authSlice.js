import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";


export const signupUser = createAsyncThunk(
  "auth/signupUser",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/signup", payload);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { msg: "Signup failed" });
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", payload);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { msg: "Login failed" });
    }
  }
);

export const refreshAccessToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/refresh", {
        refresh_token: localStorage.getItem("refreshToken"),
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { msg: "Token refresh failed" });
    }
  }
);


const initialState = {
  token: localStorage.getItem("token") || null,
  refreshToken: localStorage.getItem("refreshToken") || null,
  role: localStorage.getItem("role") || null,
  user: JSON.parse(localStorage.getItem("user")) || null,
  loading: false,
  error: null,
};


const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.role = null;
      state.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
    },
  },
  extraReducers: (builder) => {
    builder
      // Signup
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
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
        const { access_token, refresh_token, role, user } = action.payload;

        state.token = access_token;
        state.refreshToken = refresh_token;
        state.role = role?.toUpperCase() || null;
        state.user = user || null;

        localStorage.setItem("token", access_token);
        localStorage.setItem("refreshToken", refresh_token);
        localStorage.setItem("role", role?.toUpperCase());
        if (user) {
          localStorage.setItem("user", JSON.stringify(user));
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.msg || "Login failed";
      })

      // Refresh Token
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.token = action.payload.access_token;
        localStorage.setItem("token", action.payload.access_token);
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        state.token = null;
        localStorage.removeItem("token");
      });
  },
});


export const { logout } = authSlice.actions;
export default authSlice.reducer;
