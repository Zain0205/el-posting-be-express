import express from "express";
import pool from "../models/db.js";

const router = express.Router();

router.post("/like", (req, res) => {
  const {user_id, post_id} = req.body;

  pool.query("INSERT INTO likes (user_id, post_id) VALUES (?, ?)", [user_id, post_id], (err, result) => {
    if (err) res.status(400).json({message: "Error"});
    res.status(201).json({message: "Like created"});
  });

})

router.delete("/unlike/:id", (req, res) => {
  const id = req.params.id;

  pool.query("DELETE FROM likes WHERE id = ?", [id], (err, result) => {
    if (err) res.status(400).json({message: "Error"});
    res.status(200).json({message: "Like deleted"});
  });
})


export default router;