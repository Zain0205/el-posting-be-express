import express from "express";
import pool from "../models/db.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/list/:id", (req, res) => {
  const post_id = req.params.id;

  pool.query(
    `
    SELECT c.id, p.id, c.content, u.username, c.created_at, u.img_url
    FROM comments as c
    JOIN posting p on p.id = c.post_id
    JOIN users u on u.id = c.user_id
    WHERE c.post_id = ?;
`,
    [post_id],
    (err, result) => {
      if (err) res.status(400).json({ message: "Error" });
      res.status(200).send(result);
    }
  );
});

router.delete("/delete/:id", (req, res) => {
  const id = req.params.id;

  pool.query("DELETE FROM comments WHERE id = ?", [id], (err, result) => {
    if (err) res.status(400).json({ message: "Error" });
    res.status(200).json({ message: "Comment deleted" });
  });
});

router.patch("/update/:id", (req, res) => {
  const id = req.params.id;
  const { content } = req.body;

  pool.query("UPDATE comments SET content = ? WHERE id = ?", [content, id], (err, result) => {
    if (err) res.status(400).json({ message: "Error" });
    res.status(200).json({ message: "Comment updated" });
  });
});

router.post("/add", authMiddleware, (req, res) => {
  const user_id = req.user.id;
  const { post_id, content } = req.body;

  pool.query("INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)", [post_id, user_id, content], (err, result) => {
    if (err) res.status(400).json({ message: "Error" });
    res.status(201).json({ message: "Comment created" });
  });
});

export default router;
