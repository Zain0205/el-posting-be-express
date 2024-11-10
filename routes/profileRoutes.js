import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import pool from "../models/db.js";

const router = express.Router();

router.get("/user", authMiddleware, (req, res) => {
  const id = req.user.id;

  pool.query(`SELECT * FROM users WHERE id = ?`, [id], (err, result) => {
    if (err) res.status(400).json({ message: "Error" });
    res.status(200).send(result[0]);
  });
});

export default router;
