// src/features/parcels/customerSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

/* ------------------ Thunks ------------------ */

// 🔹 Fetch all parcels for logged-in customer
export const fetchCustomerParcels = createAsyncThunk(
  "customer/fetchParcels",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/customer/parcels");
      return res.data.data; // array of parcels
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch parcels"
      );
    }
  }
);

// 🔹 Fetch single parcel by ID
export const fetchCustomerParcelById = createAsyncThunk(
  "customer/fetchParcelById",
  async (id, thunkAPI) => {
    try {
      const res = await api.get(`/customer/parcels/${id}`);
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch parcel"
      );
    }
  }
);

// 🔹 Create parcel
export const createCustomerParcel = createAsyncThunk(
  "customer/createParcel",
  async (parcelData, thunkAPI) => {
    try {
      const res = await api.post("/customer/parcels", parcelData);
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to create parcel"
      );
    }
  }
);

// 🔹 Update parcel (e.g. destination)
export const updateCustomerParcel = createAsyncThunk(
  "customer/updateParcel",
  async ({ id, updates }, thunkAPI) => {
    try {
      const res = await api.patch(`/customer/parcels/${id}`, updates);
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to update parcel"
      );
    }
  }
);

// 🔹 Cancel parcel
export const cancelCustomerParcel = createAsyncThunk(
  "customer/cancelParcel",
  async (id, thunkAPI) => {
    try {
      const res = await api.post(`/customer/parcels/${id}/cancel`);
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to cancel parcel"
      );
    }
  }
);

// Fetch customer profile
export const fetchCustomerProfile = createAsyncThunk(
  "customer/fetchProfile",
  async (_, thunkAPI) => {
    try {
      const res = await api.get("/customer/profile");
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch profile"
      );
    }
  }
);

// Update customer profile
export const updateCustomerProfile = createAsyncThunk(
  "customer/updateProfile",
  async (updates, thunkAPI) => {
    try {
      const res = await api.patch("/customer/profile", updates);
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to update profile"
      );
    }
  }
);

/* ------------------ Slice ------------------ */

const customerSlice = createSlice({
  name: "customer",
  initialState: {
    parcels: [],
    currentParcel: null,
    userProfile: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      /* ----- Parcels ----- */
      .addCase(fetchCustomerParcels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerParcels.fulfilled, (state, action) => {
        state.loading = false;
        state.parcels = action.payload;
      })
      .addCase(fetchCustomerParcels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchCustomerParcelById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentParcel = null;
      })
      .addCase(fetchCustomerParcelById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentParcel = action.payload;
      })
      .addCase(fetchCustomerParcelById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createCustomerParcel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCustomerParcel.fulfilled, (state, action) => {
        state.loading = false;
        state.parcels.push(action.payload);
      })
      .addCase(createCustomerParcel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateCustomerParcel.fulfilled, (state, action) => {
        state.currentParcel = action.payload;
        const idx = state.parcels.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.parcels[idx] = action.payload;
      })

      .addCase(cancelCustomerParcel.fulfilled, (state, action) => {
        state.currentParcel = action.payload;
        const idx = state.parcels.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.parcels[idx] = action.payload;
      })

      /* ----- Profile ----- */
      .addCase(fetchCustomerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.userProfile = action.payload.data || null;
      })
      .addCase(fetchCustomerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateCustomerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCustomerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.userProfile = action.payload;
      })
      .addCase(updateCustomerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default customerSlice.reducer;
