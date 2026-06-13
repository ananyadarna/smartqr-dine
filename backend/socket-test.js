const { io } = require("socket.io-client");

const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("Connected:", socket.id);

  socket.emit(
    "join_restaurant",
    "6a2cf4ef79599d73f316c229"
  );
});

socket.on("new_order", (data) => {
  console.log("NEW ORDER", data);
});

socket.on("order_status_updated", (data) => {
  console.log("STATUS UPDATE", data);
});