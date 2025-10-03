import axios from "axios";

export const authApi = axios.create({
  baseURL: "https://deliveroo-ra7p.onrender.com/api/auth",
});
