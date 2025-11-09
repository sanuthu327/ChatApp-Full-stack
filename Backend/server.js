import { Server } from "socket.io";
import http from "http";

const server = http.createServer();
const io = new Server(server, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  console.log("user connected");

  socket.on("message", (msg) => {
    io.emit("message", msg);
  });
});

server.listen(5000, () => console.log("socket server running on 5000"));
