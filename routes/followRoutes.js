import express from "express";
import pool from "../models/db.js";

const router = express.Router();

router.post("/follow", (req, res) => {
  const { user_id, follower_id } = req.body;

  pool.query(`INSERT INTO follows (user_id, follower_id) VALUES (?, ?)`, [user_id, follower_id], (err, result) => {
    if (err) res.status(400).json({ message: "Error" });
    res.status(201).json({ message: "Follow created" });
  });
});

router.delete("/unfollow/:id", (req, res) => {
  const id = req.params.id;

  pool.query(`DELETE FROM follows WHERE id = ?`, [id], (err, result) => {
    if (err) res.status(400).json({ message: "Error" });
    res.status(200).json({ message: "Follow deleted" });
  });
});

export default router;
