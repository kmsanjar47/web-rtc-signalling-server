// let port = process.env.PORT || 5000;

// let IO = require("socket.io")(port, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//   },
// });

const app = require("express")();
const server = require("http").createServer(app, {
  Headers: {
    "user-agent": "Mozilla/5.0",
  },
});
const IO = require("socket.io")(server);
const port = process.env.PORT || 8080;

app.get("/", function (req, res) {
  res.send("Hello World!");
});

IO.use((socket, next) => {
  if (socket.handshake.query) {
    let callerId = socket.handshake.query.callerId;
    socket.user = callerId;
    next();
  }
});

// Start the server by listening on the specified port
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

IO.on("connection", (socket) => {
  console.log(socket.user, "Connected");
  socket.join(socket.user);

  socket.on("disconnect", () => {
    console.log(socket.user, "Disconnected");
    socket.leave(socket.user);
  });

  socket.on("makeCall", (data) => {
    let calleeId = data.calleeId;
    let sdpOffer = data.sdpOffer;

    socket.to(calleeId).emit("newCall", {
      callerId: socket.user,
      sdpOffer: sdpOffer,
    });
  });
  ``;
  socket.on("answerCall", (data) => {
    let callerId = data.callerId;
    let sdpAnswer = data.sdpAnswer;

    socket.to(callerId).emit("callAnswered", {
      callee: socket.user,
      sdpAnswer: sdpAnswer,
    });
  });

  socket.on("IceCandidate", (data) => {
    let calleeId = data.calleeId;
    let iceCandidate = data.iceCandidate;

    socket.to(calleeId).emit("IceCandidate", {
      sender: socket.user,
      iceCandidate: iceCandidate,
    });
  });
});
