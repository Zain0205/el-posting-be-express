import express from "express";
import pool from "../models/db.js";

const router = express.Router();

router.post("/create", (req, res) => {
  const { user_id, img_url, content } = req.body;

  pool.query("INSERT INTO posting (id, img_url, content) VALUES (?, ?, ?)", [user_id, img_url, content], (err, result) => {
    if (err) res.status(400).json({ message: "Error" });
    res.status(201).json({ message: "Post created" });
  });
});

router.get("/feed", (req, res) => {
  pool.query(`SELECT * FROM posting`, (err, result) => {
    if (err) res.status(400).json({ message: "Error" });
    res.status(200).send(result);
  });
});

router.get("/feed/:id", (req, res) => {
  const id = req.params.id;

  pool.query(`SELECT * FROM posting WHERE user_id = ?`, [id], (err, result) => {
    if (err) res.status(400).json({ message: "Error" });
    res.status(200).send(result);
  });
});

router.get("/feed/detail/:id", (req, res) => {
  const id = req.params.id;

  pool.query(`
    SELECT p.id, p.content, p.img_url, p.created_at, p.like_count, u.username 
    FROM posting as p 
    JOIN users u on u.id = p.user_id 
    WHERE p.id = ?`, [id], (err, result) => {
      if (err) res.status(400).json({ message: "Error" });
      res.status(200).send(result);
    });
});

router.delete("/delete/:id", (req, res) => {
  const id = req.params.id;

  pool.query("DELETE FROM posting WHERE id = ?", [id], (err, result) => {
    if (err) res.status(400).json({ message: "Error" });
    res.status(200).json({ message: "Post deleted" });
  });
});

export default router;
