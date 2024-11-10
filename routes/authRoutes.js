import express from "express";
import bcrypt from "bcryptjs";
import pool from "../models/db.js";
import jwt from "jsonwebtoken";

const router = express.Router();



router.post("/register", (req, res) => {
  const { email, username, password } = req.body;
  const hasedPassword = bcrypt.hashSync(password, 10);

  pool.query("INSERT INTO users (email, username, password) VALUES (?, ?, ?)", [email, username, hasedPassword], (err, result) => {
    if (err) res.status(400).json("Error");
    res.status(201).json({ message: "User created" });
  });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  pool.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
    if (err) res.status(400).json({ message: "Error" });
    if (result.length) {
      const user = result[0];
      const isPasswordCorrect = bcrypt.compareSync(password, user.password);
      if (isPasswordCorrect) {
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.cookie("token", token, { httpOnly: true, secure: false, maxAge: 24 * 60 * 60 * 1000 });
        res.status(200).json({ token });
      } else {
        res.status(400).json({ message: "Invalid credentials" });
      }
    } else {
      res.status(404).json({ message: "User Not Found" });
    }
  });
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout success" });
});

export default router;
