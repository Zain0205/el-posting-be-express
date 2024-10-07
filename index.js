import express from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/post", postRoutes);

server.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
