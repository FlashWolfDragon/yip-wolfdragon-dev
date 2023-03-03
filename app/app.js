const socket = io("ws://localhost:8080");

let kobold = { closed: "./img/Red-Closed.png", open: "./img/Red-Open.png" };
let connectedKobolds = [{ id: "", div: "", active: false }];
let koboldSquares = $(".kobold");

function createKobold(id, color) {
  const imgSrc = getImgPathFromColor(color)["closed"];
  const element = `<div class="kobold" id="${id}"><img src=${imgSrc} /></div>`;

  console.log(`Creating kobold ${element}`);
  $(".connectedKobolds").append(element);
}

function removeKobold(id) {
  console.log(`Removing kobold ${id}`);
  $(`#${id}`).remove();
}

function getImgPathFromColor(color) {
  if (color === "red")
    return { closed: "./img/red-closed.png", open: "./img/red-ppen.png" };
  if (color === "blue")
    return { closed: "./img/blue-closed.png", open: "./img/blue-open.png" };
  if (color === "green")
    return { closed: "./img/green-closed.png", open: "./img/green-open.png" };
  if (color === "purple")
    return { closed: "./img/purple-closed.png", open: "./img/purple-open.png" };
  else {
    console.error("Kobold image not found for selected color");
    return { closed: "./img/red-closed.png", open: "./img/red-ppen.png" };
  }
}

// Initialization
socket.on("connect", () => {
  console.log(`You connected with id: ${socket.id}`);
  $(".myId").html(socket.id);
});

socket.on("connectionInfo", ({ connectedClients, color }) => {
  console.log(`Got color ${color}`);

  $(".myKoboldContainer").html(
    `<div class="myKobold"><img src=${
      getImgPathFromColor(color)["closed"]
    } /></div>`
  );

  connectedKobolds = connectedClients;

  connectedClients.forEach((client) => {
    if (client.id === socket.id) return;

    createKobold(client.id, client.color);
  });
});

// Handle active connections
socket.on("koboldConnected", ({ id, color }) => {
  if (id === socket.id) return;
  createKobold(id, color);
});

socket.on("koboldDisconnected", (id) => {
  if (id === socket.id) return;
  removeKobold(id);
});

// Called when a client connects or disconnects
socket.on("updateConnection", (connectedClients) => {
  connectedKobolds = connectedClients;
  $(".numberOfConnections").html(connectedClients.length);
});

// Handle yips from other clients
socket.on("yip", (source) => {
  console.log(`Yip from ${source}`);
});

// Handle button
$("button").on("click", () => {
  socket.emit("yip", socket.id);
});
