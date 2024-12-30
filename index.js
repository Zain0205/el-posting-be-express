import express from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import likeRoutes from "./routes/likeRoutes.js";
import followRoutes from "./routes/followRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import pool from "./models/db.js";

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] } });

const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:5173", // sesuaikan dengan alamat frontend
    credentials: true,
    methods: "GET,POST,PUT,PATCH,DELETE",
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/uploads", express.static("uploads"));
app.use("/api/auth", authRoutes);
app.use("/api/post", postRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/like", likeRoutes);
app.use("/api/follow", followRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/chat", chatRoutes);

const onlineUser = new Map();

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("register", (userId) => {
    onlineUser.set(userId, socket.id);
    console.log(`User ${userId} registered with socket id ${socket.id}`);
  });

  socket.on("sendMessage", ({ sender_id, receiver_id, content }) => {
    pool.query(`INSERT INTO chats (sender_id, receiver_id, content) VALUES (?, ?, ?)`, [sender_id, receiver_id, content], (err, result) => {
      if (err) {
        console.error(err);
        return;
      }

//       pool.query(
//         `
//     SELECT
//     c.id,
//     c.sender_id,
//     sender.username AS sender_username,
//     sender.img_url AS sender_avatar,
//     c.receiver_id,
//     receiver.username AS receiver_username,
//     receiver.img_url AS receiver_avatar,
//     c.content,
//     c.created_at
// FROM chats c
//          JOIN users AS sender ON c.sender_id = sender.id
//          JOIN users AS receiver ON c.receiver_id = receiver.id
// WHERE
//     (c.sender_id = ? AND c.receiver_id = ?) OR
//     (c.sender_id = ? AND c.receiver_id = ?)
// ORDER BY c.created_at DESC
// `,
//         [sender_id, receiver_id, receiver_id, sender_id],
//         (err, result) => {
//           if (err) {
//             console.error(err);
//             return;
//           }

//           const selectedOnlineUser = onlineUser.get(receiver_id);

//           const sender = result[0];

//           if (selectedOnlineUser) {
//             io.to(selectedOnlineUser).emit("newMessage", sender);
//           }
//         }
//       );

      const selectedOnlineUser = onlineUser.get(receiver_id);

      if (selectedOnlineUser) {
        io.to(selectedOnlineUser).emit("newMessage", {
          sender_id: sender_id,
          receiver_id: receiver_id,
          content,
        });
      }
    });
  });

  socket.on("disconnect", () => {
    for (let [key, value] of onlineUser.entries()) {
      if (value === socket.id) {
        onlineUser.delete(key);
        console.log(`User ${key} disconnected`);
        break;
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
