import express from "express";
import pool from "../models/db.js";

const router = express.Router();

router.get("/comment:id", (req, res) => {
  const id = req.params.id;

  pool.query(`SELECT * FROM comments WHERE post_id = ?`, [id], (err, result) => {
    if (err) res.status(400).json({ message: "Error" });
    res.status(200).send(result);
  });
});

router.post("create", (req, res) => {
  const { user_id, post_id, content } = req.body;

  pool.query("INSERT INTO comments (user_id, post_id, content) VALUES (?, ?, ?)", [user_id, post_id, content], (err, result) => {
    if (err) res.status(400).json({ message: "Error" });
    res.status(201).json({ message: "Comment created" });
  });

})

export default router;

