import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

// Admin: fetch all users
export const fetchUsers = createAsyncThunk(
  "admin/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/admin/users");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Admin: fetch all parcels
export const fetchAllParcels = createAsyncThunk(
  "admin/fetchAllParcels",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/parcels");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Admin: update parcel status
export const updateParcelStatus = createAsyncThunk(
  "admin/updateParcelStatus",
  async ({ parcelId, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/parcels/${parcelId}`, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    users: [],
    parcels: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Users
      .addCase(fetchUsers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Parcels
      .addCase(fetchAllParcels.fulfilled, (state, action) => {
        state.parcels = action.payload;
      })

      // Update status
      .addCase(updateParcelStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        state.parcels = state.parcels.map((p) =>
          p.id === updated.id ? updated : p
        );
      });
  },
});

export default adminSlice.reducer;
