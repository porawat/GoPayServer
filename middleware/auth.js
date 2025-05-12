import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
config();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  console.log('Auth Header:', authHeader); // ดีบั๊ก header
  if (!authHeader) {
    return res.status(403).json({ message: 'ไม่พบโทเค็น' });
  }

  const token = authHeader.split(' ')[1];
  console.log('Token:', token); // ดีบั๊ก token
  if (!token) {
    return res.status(403).json({ message: 'รูปแบบโทเค็นไม่ถูกต้อง' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('JWT Verify Error:', err.message); // ดีบั๊กข้อผิดพลาด
      return res.status(401).json({
        status: 'error',
        code: 4010,
        message: 'โทเค็นไม่ถูกต้องหรือหมดอายุ'
      });
    }
    req.user = decoded;
    console.log('Decoded User:', decoded); // ดีบั๊กข้อมูลผู้ใช้
    next();
  });
};

export { verifyToken };
