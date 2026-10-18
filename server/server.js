
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("CodeShare server is running!");
});

const httpServer = createServer(app);


const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL
].filter(Boolean);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});


// Temporary in-memory room storage
const rooms = new Map();

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("room:join", ({ roomId }) => {
    if (typeof roomId !== "string" || !roomId.trim()) return;

    // Leave a previous room if this socket joins another one
    const previousRoom = socket.data.roomId;

    if (previousRoom && previousRoom !== roomId) {
      socket.leave(previousRoom);
      io.to(previousRoom).emit("room:users", {
        count: io.sockets.adapter.rooms.get(previousRoom)?.size ?? 0
      });
    }

    socket.join(roomId);
    socket.data.roomId = roomId;

    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        code: "// Welcome to CodeShare!\n// Start writing code here.\n\n",
        language: "javascript"
      });
    }

    // Send the existing code to the joining user
    socket.emit("room:state", rooms.get(roomId));

    // Update the user count for everyone in this room
    io.to(roomId).emit("room:users", {
      count: io.sockets.adapter.rooms.get(roomId)?.size ?? 0
    });

    console.log(`${socket.id} joined room ${roomId}`);
  });

  socket.on("editor:change", ({ roomId, code }) => {
    if (
      roomId !== socket.data.roomId ||
      typeof code !== "string" ||
      code.length > 200_000
    ) {
      return;
    }

    const room = rooms.get(roomId);
    if (!room) return;

    room.code = code;

    // Broadcast to everyone else in the same room
    socket.to(roomId).emit("editor:update", { code });
  });

  socket.on("editor:language", ({ roomId, language }) => {
    if (
      roomId !== socket.data.roomId ||
      typeof language !== "string"
    ) {
      return;
    }

    const room = rooms.get(roomId);
    if (!room) return;

    room.language = language;
    socket.to(roomId).emit("editor:language:update", { language });
  });

  socket.on("disconnect", () => {
    const roomId = socket.data.roomId;

    if (roomId) {
      io.to(roomId).emit("room:users", {
        count: io.sockets.adapter.rooms.get(roomId)?.size ?? 0
      });
    }

    console.log("Disconnected:", socket.id);
  });
});


httpServer.listen(PORT, () => {
  console.log(`CodeShare server running on port ${PORT}`);
});
