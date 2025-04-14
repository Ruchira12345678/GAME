const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {};

io.on("connection", (socket) => {
  socket.on("joinRoom", (room) => {
    socket.join(room);
    if (!rooms[room]) rooms[room] = [];
    rooms[room].push(socket);

    if (rooms[room].length === 1) {
      socket.emit("waiting");
    } else if (rooms[room].length === 2) {
      rooms[room].forEach(s => s.emit("startGame"));
    }
  });

  socket.on("pull", () => {
    const room = [...socket.rooms][1];
    if (!room) return;

    if (!rooms[room].pulls) rooms[room].pulls = {};
    const strength = Math.floor(Math.random() * 10) + 1;
    rooms[room].pulls[socket.id] = strength;

    if (Object.keys(rooms[room].pulls).length === 2) {
      const [id1, id2] = Object.keys(rooms[room].pulls);
      const s1 = rooms[room].pulls[id1];
      const s2 = rooms[room].pulls[id2];

      const winner = s1 > s2 ? id1 : s2 > s1 ? id2 : "tie";

      rooms[room].forEach(s => {
        s.emit("roundResult", {
          winner: winner === "tie" ? "tie" : s.id === winner ? "player" : "opponent",
          playerStrength: rooms[room].pulls[s.id],
          opponentStrength: rooms[room].pulls[s.id === id1 ? id2 : id1]
        });
      });

      delete rooms[room].pulls;
    }
  });

  socket.on("disconnect", () => {
    for (const room in rooms) {
      rooms[room] = rooms[room].filter(s => s.id !== socket.id);
      if (rooms[room].length === 0) delete rooms[room];
    }
  });
});

server.listen(3000, () => {
  console.log("🌐 Server running at http://localhost:3000");
});
