import { io } from "socket.io-client";
import { sanitizeURL } from "./utils";

const getSocketURL = () => {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return sanitizeURL(process.env.NEXT_PUBLIC_SOCKET_URL);
  }
  if (process.env.NEXT_PUBLIC_API_URL) {
    const apiBase = sanitizeURL(process.env.NEXT_PUBLIC_API_URL);
    return apiBase.replace(/\/api\/?$/, "");
  }
  if (typeof window !== "undefined") {
    return `http://${window.location.hostname}:5000`;
  }
  return "http://localhost:5000";
};

export const socket = io(getSocketURL());

socket.on("connect", () => {
  console.log("Socket Connected:", socket.id);
});