import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

// Customer: fetch own parcels
export const fetchCustomerParcels = createAsyncThunk(
  "customer/fetchParcels",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/parcels/my-parcels");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Customer: create new parcel
export const createParcel = createAsyncThunk(
  "customer/createParcel",
  async (parcelData, { rejectWithValue }) => {
    try {
      const response = await api.post("/parcels", parcelData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Customer: track parcel by ID
export const fetchParcelDetails = createAsyncThunk(
  "customer/fetchParcelDetails",
  async (parcelId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/parcels/${parcelId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const customerSlice = createSlice({
  name: "customer",
  initialState: {
    parcels: [],
    currentParcel: null,
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // All parcels
      .addCase(fetchCustomerParcels.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCustomerParcels.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.parcels = action.payload;
      })
      .addCase(fetchCustomerParcels.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Create parcel
      .addCase(createParcel.fulfilled, (state, action) => {
        state.parcels.push(action.payload);
      })

      // Parcel details
      .addCase(fetchParcelDetails.fulfilled, (state, action) => {
        state.currentParcel = action.payload;
      });
  },
});

export default customerSlice.reducer;
