import axios from "axios";
import { useAuthStore } from "@/stores/auth.store";
import { sanitizeURL } from "@/lib/utils";

const getBaseURL = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    let url = sanitizeURL(process.env.NEXT_PUBLIC_API_URL);
    if (!url.match(/\/api\/?$/)) {
      url = url.replace(/\/+$/, "") + "/api";
    }
    return url;
  }
  if (typeof window !== "undefined") {
    return `http://${window.location.hostname}:5000/api`;
  }
  return "http://localhost:5000/api";
};

export const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);