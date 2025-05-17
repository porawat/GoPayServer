// middleware/auth.js
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
config();

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'ไม่มี token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    // console.log('Decoded token:', decoded);
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: 'token ไม่ถูกต้อง' });
  }
};