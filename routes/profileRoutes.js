import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import pool from "../models/db.js";
import multer from "multer";
import path from "path";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.get("/user", authMiddleware, (req, res) => {
  const id = req.user.id;

  pool.query(`SELECT * FROM users WHERE id = ?`, [id], (err, result) => {
    if (err) res.status(400).json({ message: "Error" });
    res.status(200).send(result[0]);
  });
});

router.get("/check/:id", (req, res) => {
  const id = req.params.id;

  pool.query(`SELECT * FROM users WHERE id = ?`, [id], (err, result) => {
    if (err) res.status(400).json({ message: "Error" });
    res.status(200).send(result[0]);
  });
});

router.get("/recomend", authMiddleware, (req, res) => {
  const id = req.user.id;

  pool.query(`SELECT * FROM users WHERE id != ? ORDER BY RAND() LIMIT 6`, [id], (err, result) => {
    if (err) res.status(400).json({ message: "Error" });
    res.status(200).send(result);
  });
});

router.patch("/edit", authMiddleware, upload.single("img_url"), (req, res) => {
  const { username, bio } = req.body;
  const id = req.user.id;
  const img_url = req.file ? `/uploads/${req.file.filename}` : null;

  pool.query("UPDATE users SET username = ?, bio = ?, img_url = ? WHERE id = ?", [username, bio, img_url, id], (err, result) => {
    if (err) return res.status(400).json({ message: "Error" });
    res.status(200).json({ message: "Updated" });
  });
});

router.get("/search", (req, res) => {
  const { username } = req.query;

  pool.query(`SELECT * FROM users WHERE username LIKE ?`, [`%${username}%`], (err, result) => {
    if (err) return res.status(400).json({ message: "Error" });
    res.status(200).send(result);
  });
})

export default router;
