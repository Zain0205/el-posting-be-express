import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();


const authMiddleware = (req, res, next) => {
   const token = req.cookies.token;
  if (!token) return res.status(403).json({ message: 'Token required' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

export default authMiddleware;