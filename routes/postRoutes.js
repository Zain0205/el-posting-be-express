import express from "express";
import pool from "../models/db.js";
import multer from "multer";
import path from "path";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.post("/create", authMiddleware, upload.single("img_url"), (req, res) => {
  const { content } = req.body;
  const img_url = req.file ? `/uploads/${req.file.filename}` : null;
  const user_id = req.user.id;

  pool.query("INSERT INTO posting (user_id, img_url, content) VALUES (?, ?, ?)", [user_id, img_url, content], (err, result) => {
    if (err) {

      return res.status(400).json({ message: "Error" });
    }
    res.status(201).json({ message: "Post created" });
  });
});

router.get("/feed", (req, res) => {
  pool.query(`
    SELECT p.id, p.content, p.img_url, p.created_at, p.like_count, u.username, u.id as user_id, u.img_url as profile_img 
    FROM posting as p 
    JOIN users u on u.id = p.user_id 
    ORDER BY p.created_at DESC
    `, (err, result) => {
    if (err) return res.status(400).json({ message: "Error" });
    res.status(200).send(result);
  });
});

router.get("/user/feed/:id", (req, res) => {
  const id = req.params.id;

  pool.query(`SELECT * FROM posting p WHERE user_id = ? ORDER BY p.created_at DESC`, [id], (err, result) => {
    if (err) res.status(400).json({ message: "Error" });
    res.status(200).send(result);
  });
});

router.get("/detail/:id", (req, res) => {
  const id = req.params.id;

  pool.query(
    `
    SELECT p.id, p.content, p.img_url, p.created_at, p.like_count, u.username, u.id as user_id, u.img_url as profile_img 
    FROM posting as p 
    JOIN users u on u.id = p.user_id 
    WHERE p.id = ?`,
    [id],
    (err, result) => {
      if (err) res.status(400).json({ message: "Error" });
      res.status(200).send(result);
    }
  );
});

router.delete("/delete/:id", (req, res) => {
  const id = req.params.id;

  pool.query("DELETE FROM posting WHERE id = ?", [id], (err, result) => {
    if (err) res.status(400).json({ message: "Error" });
    res.status(200).json({ message: "Post deleted" });
  });
});

router.patch("/:id/edit", authMiddleware, upload.single("img_url"), (req, res) => {
  const id = req.params.id;
  const { content } = req.body;
  console.log(req.file);
  const img_url = req.file ? `/uploads/${req.file.filename}` : null;

  const query = img_url
    ? "UPDATE posting SET content = ?, img_url = ? WHERE id = ?"
    : "UPDATE posting SET content = ? WHERE id = ?";

  const params = img_url ? [content, img_url, id] : [content, id];

  pool.query(query, params, (err, result) => {
    if (err) res.status(400).json({ message: "Error" });
    res.status(200).json({ message: "Post updated" });
  });
});

export default router;
