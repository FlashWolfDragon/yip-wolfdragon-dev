const socket = io("wss://yip.wolfdragon.dev");

let kobold = { closed: "./img/Red-Closed.png", open: "./img/Red-Open.png" };
let connectedKobolds = [{ id: "", div: "", active: false }];
let koboldSquares = $(".kobold");
let muted = false;
let audioClips = ["yip1.mp3", "yip2.mp3"];
let audioClipsQuiet = ["yip1-quiet.mp3", "yip2-quiet.mp3"];

function createKobold(id, color) {
  const imgSrc = getImgPathFromColor(color)["closed"];
  const element = `<div class="kobold ${color}" id="${id}"><img src=${imgSrc} /></div>`;

  console.log(`Creating kobold ${element}`);
  $(".connectedKobolds").append(element);

  let koboldImg = document.getElementById(id);
  koboldImg.addEventListener("animationend", () => {
    $(`#${id}`).removeClass("speaking");
  });
}

function removeKobold(id) {
  console.log(`Removing kobold ${id}`);

  let koboldImg = document.getElementById(id);

  // hopefully not cleaning up won't be a problem
  // koboldImg.removeEventListener("animationend");

  $(`#${id}`).remove();
}

function getImgPathFromColor(color) {
  if (color === "red")
    return { closed: "./img/red-closed.png", open: "./img/red-open.png" };
  if (color === "blue")
    return { closed: "./img/blue-closed.png", open: "./img/blue-open.png" };
  if (color === "green")
    return { closed: "./img/green-closed.png", open: "./img/green-open.png" };
  if (color === "purple")
    return { closed: "./img/purple-closed.png", open: "./img/purple-open.png" };
  else {
    console.error("Kobold image not found for selected color");
    return { closed: "./img/red-closed.png", open: "./img/red-open.png" };
  }
}

// Load kobolds to avoid flash on first yip
$(document).ready(() => {
  console.log("ready");
  $(".preload").css({ display: "none" });
});

// Initialize Connection
socket.on("connect", () => {
  console.log(`You connected with id: ${socket.id}`);
  $(".myId").html(socket.id);
});

socket.on("connectionInfo", ({ connectedClients, color, yipCount }) => {
  console.log(`Got color ${color}`);

  $(".myKobold").addClass(color);
  $(".yipCounter").html(yipCount);

  let koboldImg = document.getElementsByClassName("myKoboldImg")[0];
  koboldImg.addEventListener("animationend", () => {
    const myKobold = $(".myKobold");
    myKobold.removeClass("speaking");
  });

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

function AnimateYip(querySelector) {
  const koboldImg = document.querySelector(`${querySelector} img`);
  koboldImg.style.animation = "none";
  koboldImg.offsetHeight; /* trigger reflow */
  koboldImg.style.animation = null;

  const myKobold = $(querySelector);
  myKobold.addClass("speaking");
}

function PlayAudioYip(quiet) {
  let tempAudioElement;

  if (quiet) {
    tempAudioElement = $(
      `<audio autoplay src="./sounds/${
        audioClipsQuiet[Math.floor(Math.random() * audioClips.length)]
      }" />`
    ).appendTo(".volume");
  } else {
    tempAudioElement = $(
      `<audio autoplay src="./sounds/${
        audioClips[Math.floor(Math.random() * audioClips.length)]
      }" />`
    ).appendTo(".volume");
  }

  setTimeout(() => {
    tempAudioElement.remove();
  }, 1500);
}

// Handle yips from other clients
socket.on("yip", (id) => {
  AnimateYip(`#${id}`);
  if (!muted) PlayAudioYip(true);
});

socket.on("updateYipCount", (yipCount) => {
  $(".yipCounter").html(yipCount);
});

// Handle client yip
$(".myKobold").on("click", () => {
  AnimateYip(`.myKobold`);
  if (!muted) PlayAudioYip(true);

  socket.emit("yip", socket.id);
});

$(".volume img").on("click", () => {
  if (muted) {
    $(".volume").removeClass("muted");
  } else {
    $(".volume").addClass("muted");
  }

  muted = !muted;
});
