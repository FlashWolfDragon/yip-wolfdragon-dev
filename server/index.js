const path = require("path");
const fs = require("fs");
const express = require("express");
const socketIO = require("socket.io");

const app = express();
const server = app.listen(process.env.PORT | 8080, () =>
  console.log("Starting server on port 8080")
);
app.use(express.static(path.resolve(__dirname, "..", "app")));

const io = socketIO(server, {
  cors: { origin: "*" },
});

// Array of clients connected
// schema: { id: client id, color: assigned color }
clientsConnected = [];
const possibleColors = ["red", "blue", "green", "purple"];
let yipCount = 0;

function addYip() {
  yipCount++;
}

// On new connection
io.on("connection", (socket) => {
  console.log(`User connected with id ${socket.id}`);
  io.emit("updateYipCount", yipCount);

  // Assign a random color to new client
  const assignedColor =
    possibleColors[Math.floor(Math.random() * possibleColors.length)];
  const clientObject = {
    id: socket.id,
    color: assignedColor,
  };
  // Add to list of current clients...
  clientsConnected.push(clientObject);

  // Send connection info to connected client
  io.to(socket.id).emit("connectionInfo", {
    connectedClients: clientsConnected,
    color: clientObject.color,
    yipCount,
  });

  // Let everyone know that a client connected and their info
  io.emit("koboldConnected", { id: socket.id, color: clientObject.color });
  io.emit("updateConnection", clientsConnected);

  // Handle button presses
  socket.on("yip", (id) => {
    console.log(`Recieved Yip from ${id}`);
    addYip();
    socket.broadcast.emit("yip", socket.id);
    io.emit("updateYipCount", yipCount);
  });

  // Handle client disconnecting
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    // Remove client from connectedClients
    const index = clientsConnected.indexOf(clientObject);
    clientsConnected.splice(index, 1);

    io.emit("koboldDisconnected", socket.id);
    io.emit("updateConnection", clientsConnected);
  });
});
