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

    // Call waiter notification channel
    socket.on("call_waiter", (data: { restaurantId: string; tableId: string; tableNumber: number; tableName: string }) => {
      io.to(data.restaurantId).emit("waiter_called", data);
    });

    // Claim waiter call channel
    socket.on("claim_waiter", (data: { restaurantId: string; tableId: string; waiterName: string }) => {
      io.to(data.restaurantId).emit("waiter_claimed", data);
    });

    // Resolve waiter notification channel
    socket.on("resolve_waiter", (data: { restaurantId: string; tableId: string }) => {
      io.to(data.restaurantId).emit("waiter_resolved", data);
    });

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