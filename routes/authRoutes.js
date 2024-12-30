import express from "express";
import bcrypt from "bcryptjs";
import pool from "../models/db.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: "Gmail", // Sesuaikan dengan penyedia email Anda
  auth: {
    user: process.env.EMAIL_USER, // Email pengirim
    pass: process.env.EMAIL_PASSWORD, // Password email pengirim
  },
});

// Endpoint untuk memulai proses lupa password
router.post("/forgot-password", (req, res) => {
  const { email } = req.body;

  pool.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (!result.length) return res.status(404).json({ message: "User not found" });

    const user = result[0];
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "15m" }); // Token valid 15 menit

    // URL untuk reset password
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;


    // Kirim email
    transporter.sendMail(
      {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Password Reset Request",
        html: `<p>Click the link below to reset your password:</p>
               <a href="${resetUrl}">${resetUrl}</a>
               <p>This link will expire in 15 minutes.</p>`,
      },
      (emailErr, info) => {
        if (emailErr) return console.log(emailErr);
        res.status(200).json({ message: "Reset password link sent" });
      }
    );

  });
});

// Endpoint untuk reset password
// router.post("/reset-password/:token", (req, res) => {
//   const { token } = req.params;
//   const { newPassword } = req.body;

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const hashedPassword = bcrypt.hashSync(newPassword, 10);

//     pool.query(
//       "UPDATE users SET password = ? WHERE id = ?",
//       [hashedPassword, decoded.id],
//       (err, result) => {
//         if (err) return res.status(500).json({ message: "Database error" });
//         res.status(200).json({ message: "Password reset successful" });
//       }
//     );
//   } catch (err) {
//     res.status(400).json({ message: "Invalid or expired token" });
//   }
// });

router.post("/reset-password/:token", (req, res) => {
  const { token } = req.params;
  const { newPassword, confirmPassword } = req.body;

  // Validasi apakah newPassword dan confirmPassword cocok
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    // Verifikasi token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Hash password baru
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    // Update password di database
    pool.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, decoded.id],
      (err, result) => {
        if (err) {
          return res.status(500).json({ message: "Database error" });
        }
        res.status(200).json({ message: "Password reset successful" });
      }
    );
  } catch (err) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
});


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
