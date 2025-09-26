import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../api/axios";


export const signupUser = createAsyncThunk(
    "auth/signupUser",
    async({name,email,phone_number,password,role,security_question,security_answer},{rejectWithValue})=>{
        try{
            const response = await axios.post("auth/signup",{name,email,phone_number,password,role,security_question,security_answer})
            return response.data
        }catch(err){
            return rejectWithValue(err.response?.data?.msg || "Signup failed")
        }

    }
)

export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async({email,password},{rejectWithValue})=>{
        try{
            const response = await axios.post("auth/login",{email,password})
            return response.data
        }catch (err){
            return rejectWithValue(err.response?.data?.msg || "Login failed")

        }
    }
)



const initialState = {
    token: localStorage.getItem("token") || null,
    refreshToken : localStorage.getItem("refreshToken") || null,
    role: localStorage.getItem("role") || null,
    user: null,
    loading: false,
    error: null,
}

const authSlice = createSlice({
    name:"auth",
    initialState,
    reducers:{
        logout:(state)=>{
            state.token = null
            state.refreshToken = null
            state.role = null
            state.user = null
            state.error = null
            localStorage.removeItem("token")
            localStorage.removeItem("refreshToken")
            localStorage.removeItem("role")

        },
        setUserFromToken:(state,action)=>{
            state.token = action.payload.token
            state.role = action.payload.role
            localStorage.setItem("token",action.payload.token)
            localStorage.setItem("role",action.payload.role)
        }

    },
    extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        state.role = action.payload.role;
        localStorage.setItem("token", action.payload.access_token);
        localStorage.setItem("refreshToken", action.payload.refresh_token);
        localStorage.setItem("role", action.payload.role);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
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
        state.error = action.payload;
      });
  },
});

export const { logout, setUserFromToken } = authSlice.actions;
export default authSlice.reducer;
