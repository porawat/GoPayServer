// controllers/authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db/index.js';
import { config } from 'dotenv';

config();

const User = db.user;

const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'ต้องระบุชื่อผู้ใช้และรหัสผ่าน' });
  }

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(400).json({ message: 'ไม่พบผู้ใช้' });
    }

    if (!user.password) {
      return res.status(400).json({ message: 'รหัสผ่านของผู้ใช้ไม่ถูกตั้งค่า' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'ข้อมูลรับรองไม่ถูกต้อง' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token, role: user.role, username: user.username });
  } catch (error) {
    console.error('ข้อผิดพลาดในการล็อกอิน:', error);
    res.status(500).json({ message: 'ข้อผิดพลาดของเซิร์ฟเวอร์', error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { id: req.user.id },
      attributes: ['username', 'email', 'role', 'created_at', 'full_name', 'phone'],
    });
    if (!user) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
    }
    res.json(user);
  } catch (error) {
    console.error('ข้อผิดพลาดในการดึงโปรไฟล์:', error);
    res.status(500).json({ message: 'ข้อผิดพลาดของเซิร์ฟเวอร์', error: error.message });
  }
};

const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: 'ต้องระบุรหัสผ่านเก่าและรหัสผ่านใหม่' });
  }

  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'รหัสผ่านเก่าไม่ถูกต้อง' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });
    res.json({ message: 'เปลี่ยนรหัสผ่านสำเร็จ' });
  } catch (error) {
    console.error('ข้อผิดพลาดในการเปลี่ยนรหัสผ่าน:', error);
    res.status(500).json({ message: 'ข้อผิดพลาดของเซิร์ฟเวอร์', error: error.message });
  }
};

const updateProfile = async (req, res) => {
  const { email, full_name, phone } = req.body;
  if (!email || !full_name) {
    return res.status(400).json({ message: 'ต้องระบุอีเมลและชื่อเต็ม' });
  }

  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
    }

    await user.update({ email, full_name, phone: phone || null });
    res.json({ message: 'อัปเดตโปรไฟล์สำเร็จ' });
  } catch (error) {
    console.error('ข้อผิดพลาดในการอัปเดตโปรไฟล์:', error);
    res.status(500).json({ message: 'ข้อผิดพลาดของเซิร์ฟเวอร์', error: error.message });
  }
};

const getDashboard = async (req, res) => {
  try {
    const totalMembers = await User.count();
    const activeUsers = await User.count({ where: { is_active: true } });
    const pendingTasks = 0; // แทนที่ด้วย query ถ้ามี model tasks
    const completedTasks = 0; // แทนที่ด้วย query ถ้ามี model tasks

    res.json({
      message: `ยินดีต้อนรับ ${req.user.username} สู่แดชบอร์ด`,
      totalMembers,
      activeUsers,
      pendingTasks,
      completedTasks,
      role: req.user.role,
    });
  } catch (error) {
    console.error('ข้อผิดพลาดในการดึงข้อมูลแดชบอร์ด:', error);
    res.status(500).json({ message: 'ข้อผิดพลาดของเซิร์ฟเวอร์', error: error.message });
  }
};

const getSettings = (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'ปฏิเสธการเข้าถึง: เฉพาะผู้ดูแลระบบเท่านั้น' });
  }
  res.json({ message: `ยินดีต้อนรับ ${req.user.username} สู่การตั้งค่า`, role: req.user.role });
};

const getmembers = (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'ปฏิเสธการเข้าถึง: เฉพาะผู้ดูแลระบบเท่านั้น' });
  }
  res.json({ message: `ยินดีต้อนรับ ${req.user.username} สู่สมาชิก`, role: req.user.role });
};

export { login, getProfile, changePassword, updateProfile, getDashboard, getSettings, getmembers };