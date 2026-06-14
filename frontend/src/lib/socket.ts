import { io } from "socket.io-client";

const getSocketURL = () => {
  if (typeof window !== "undefined") {
    return `http://${window.location.hostname}:5000`;
  }
  return "http://localhost:5000";
};

export const socket = io(getSocketURL());

socket.on("connect", () => {
  console.log("Socket Connected:", socket.id);
});