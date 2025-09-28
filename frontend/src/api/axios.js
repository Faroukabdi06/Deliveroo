import axios from "axios";

const BASE_URL = "https://deliveroo-ra7p.onrender.com/api";

const api = axios.create({
    baseURL:BASE_URL,
    headers:{
        "Content-Type":"application/json"
    },
})

api.interceptors.request.use(
    (config)=>{
        const token = localStorage.getItem("token");
        if (token){
            config.headers.Authorization = `Beare ${token}`
        }
        return config
    },
    (error)=>Promise.reject(error)
);

export default api;