import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConfig from '../config/db.js';
import { config } from 'dotenv';

config();

const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'ต้องระบุชื่อผู้ใช้และรหัสผ่าน' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT * FROM users WHERE username = ?', [username]);

    if (rows.length === 0) {
      await connection.end();
      return res.status(400).json({ message: 'ไม่พบผู้ใช้' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await connection.end();
      return res.status(400).json({ message: 'ข้อมูลรับรองไม่ถูกต้อง' });
    }

    const token = jwt.sign({ id: user.id, role: user.role, username: user.username, owner: user.userid }, process.env.JWT_SECRET, {
      expiresIn: '8h',
    });
    res.json({ token, role: user.role, username: user.username, owner: user.userid });
    await connection.end();
  } catch (error) {
    console.error('ข้อผิดพลาดในการล็อกอิน:', error);
    res.status(500).json({ message: 'ข้อผิดพลาดของเซิร์ฟเวอร์', error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT username, email, role, created_at, full_name, phone FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) {
      await connection.end();
      return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
    }
    res.json(rows[0]);
    await connection.end();
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
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT password FROM users WHERE id = ?', [req.user.id]);

    if (rows.length === 0) {
      await connection.end();
      return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      await connection.end();
      return res.status(400).json({ message: 'รหัสผ่านเก่าไม่ถูกต้อง' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await connection.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);
    await connection.end();
    res.json({ message: 'เปลี่ยนรหัสผ่านสำเร็จ' });
  } catch (error) {
    console.error('ข้อผิดพลาดในการเกี่ยวกับการเปลี่ยนรหัสผ่าน:', error);
    res.status(500).json({ message: 'ข้อผิดพลาดของเซิร์ฟเวอร์', error: error.message });
  }
};

const updateProfile = async (req, res) => {
  const { email, full_name, phone } = req.body;
  if (!email || !full_name) {
    return res.status(400).json({ message: 'ต้องระบุอีเมลและชื่อเต็ม' });
  }

  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute(
      'UPDATE users SET email = ?, full_name = ?, phone = ? WHERE id = ?',
      [email, full_name, phone || null, req.user.id]
    );
    await connection.end();
    res.json({ message: 'อัปเดตโปรไฟล์สำเร็จ' });
  } catch (error) {
    console.error('ข้อผิดพลาดในการเกี่ยวกับการอัปเดตโปรไฟล์:', error);
    res.status(500).json({ message: 'ข้อผิดพลาดของเซิร์ฟเวอร์', error: error.message });
  }
};

const getDashboard = async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);

    // ดึงข้อมูลสมาชิกทั้งหมด
    const [totalMembersRows] = await connection.execute('SELECT COUNT(*) AS count FROM users');
    const totalMembers = totalMembersRows[0].count;

    // ดึงข้อมูลผู้ใช้ที่ใช้งาน
    const [activeUsersRows] = await connection.execute('SELECT COUNT(*) AS count FROM users WHERE is_active = 1');
    const activeUsers = activeUsersRows[0].count;

    // สมมติว่ามีตาราง tasks สำหรับงาน
    const [pendingTasksRows] = await connection.execute('SELECT COUNT(*) AS count FROM tasks WHERE status = "pending"');
    const pendingTasks = pendingTasksRows[0].count || 0;

    const [completedTasksRows] = await connection.execute('SELECT COUNT(*) AS count FROM tasks WHERE status = "completed"');
    const completedTasks = completedTasksRows[0].count || 0;

    await connection.end();

    res.json({
      message: `ยินดีต้อนรับ ${req.user.username} สู่แดชบอร์ด`,
      totalMembers,
      activeUsers,
      pendingTasks,
      completedTasks,
      role: req.user.role,
    });
  } catch (error) {
    console.error('ข้อผิดพลาดในการเกี่ยวกับการดึงข้อมูลแดชบอร์ด:', error);
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

export { login, getProfile, changePassword, updateProfile, getDashboard, getSettings, getmembers, };