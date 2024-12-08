import express from "express";
import pool from "../models/db.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/list-chat", authMiddleware, (req, res) => {
  const userId = req.user.id;

  pool.query(
    `SELECT 
      u.id,
      u.username,
      u.img_url,
      MAX(c.content) AS last_message,
      MAX(c.created_at) AS last_message_time
    FROM
      chats c
    INNER JOIN
      users u
    ON (c.sender_id = u.id OR c.receiver_id = u.id)
    WHERE (c.sender_id = ? OR c.receiver_id = ?) AND u.id != ?
    GROUP BY
      u.id, u.username, u.img_url
    ORDER BY
      last_message_time DESC
`,
    [userId, userId, userId],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.status(200).json(result);
    }
  );
});

router.get("/chat-history/:reciverId", authMiddleware, (req, res) => {
  const { reciverId } = req.params;
  const sender_id = req.user.id;

  pool.query(
    `
    SELECT
    c.id,
    c.sender_id,
    sender.username AS sender_username,
    sender.img_url AS sender_avatar,
    c.receiver_id,
    receiver.username AS receiver_username,
    receiver.img_url AS receiver_avatar,
    c.content,
    c.created_at
FROM chats c
         JOIN users AS sender ON c.sender_id = sender.id
         JOIN users AS receiver ON c.receiver_id = receiver.id
WHERE
    (c.sender_id = ? AND c.receiver_id = ?) OR
    (c.sender_id = ? AND c.receiver_id = ?)
ORDER BY c.created_at;
`,
    [sender_id, reciverId, reciverId, sender_id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Database error" });
      res.status(200).json(result);
    }
  );
});

export default router;
