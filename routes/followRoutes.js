import express from "express";
import pool from "../models/db.js";

const router = express.Router();

router.post("/add", (req, res) => {
  const { userFollowing, userFollowed } = req.body;

  pool.query(`CALL FollowUser(?, ?)`, [userFollowing, userFollowed], (err, result) => {
    if (err) return res.status(400).json({ message: "Error" });
    res.status(200).json({ message: "User Followed" });
  });
});

router.post("/remove", (req, res) => {
  const { userFollowing, userFollowed } = req.body;

  pool.query(`CALL UnfollowUser(?, ?)`, [userFollowing, userFollowed], (err, result) => {
    if (err) res.status(400).json({ message: "Error" });
    res.status(200).json({ message: "Follow deleted" });
  });
});

router.get("/status/:follower_id/:following_id", (req, res) => {
  const { follower_id, following_id } = req.params;

  pool.query(`SELECT * FROM follows WHERE user_followed = ? AND user_following = ?`, [following_id, follower_id], (err, result) => {
    if (err) return res.status(400).json({ message: "Error" });
    res.json({ isFollowing: result.length > 0 });
  });
});

export default router;
