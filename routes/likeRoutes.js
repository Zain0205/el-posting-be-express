import express from "express";
import pool from "../models/db.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", authMiddleware, (req, res) => {
  const { post_id } = req.body;
  const user_id = req.user.id;

  pool.query("INSERT INTO likes (user_id, post_id) VALUES (?, ?)", [user_id, post_id], (err, result) => {
    if (err) return res.status(400).json({ message: "Error" });
    res.status(200).json({ message: "Post Liked" });
  });
});

router.post("/remove", authMiddleware, (req, res) => {
  const { post_id } = req.body;
  const user_id = req.user.id;

  pool.query("DELETE FROM likes WHERE user_id = ? AND post_id = ?", [user_id, post_id], (err, result) => {
    if (err) res.status(400).json({ message: "Error" });
    res.status(200).json({ message: "Like deleted" });
  });
});

router.get("/status/:user_id/:post_id", (req, res) => {
  const { user_id, post_id } = req.params;

  pool.query("SELECT * FROM likes WHERE user_id = ? AND post_id = ?", [user_id, post_id], (err, result) => {
    if (err) res.status(400).json({ message: "Error" });
    res.json({ isLiked: result.length > 0 });
  });
});

export default router;
