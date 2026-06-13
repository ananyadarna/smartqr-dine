import { Server } from "socket.io";

let io: Server;

export const initializeSocket = (
  server: any
) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log(
      `Socket Connected: ${socket.id}`
    );

    socket.on(
      "join_restaurant",
      (restaurantId: string) => {
        socket.join(restaurantId);
      }
    );

    socket.on("disconnect", () => {
      console.log(
        `Socket Disconnected: ${socket.id}`
      );
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error(
      "Socket.IO not initialized"
    );
  }

  return io;
};