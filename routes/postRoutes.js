import express from "express";
import pool from "../models/db.js";

const router = express.Router();

router.post("/create", (req, res) => {
  const { id, img_url, content } = req.body;

   pool.query("INSERT INTO posts (id, img_url, content) VALUES (?, ?, ?)", [id, img_url, content], (err, result) => {
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

export default router;
