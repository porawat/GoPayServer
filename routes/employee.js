// routes/employee.js
import express from 'express';
import bcrypt from 'bcrypt';
import db from '../db/index.js';
import { verifyToken } from '../middleware/auth.js';
import { Op } from 'sequelize';

const router = express.Router();

const Employee = db.employee;
const EmployeeRole = db.employeeRole;
const Shop = db.shop;

// Debugging database configuration
console.log('Employee model shop_id type:', Employee.rawAttributes.shop_id.type);

const checkRole = (roles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    console.log('User role:', userRole, 'Expected roles:', roles);
    if (!userRole) {
      return res.status(403).json({ message: 'ไม่มีข้อมูล role ใน token' });
    }
    if (!roles.some((role) => userRole.toLowerCase() === role.toLowerCase() || userRole === 'Admin User')) {
      return res.status(403).json({ message: 'คุณไม่มีสิทธิ์', userRole });
    }
    next();
  };
};

// เพิ่ม route สำหรับดึงพนักงานทั้งหมดของร้านค้า
router.get('/shop/:shopId', verifyToken, checkRole(['admin', 'Admin User']), async (req, res) => {
  console.log('GET /employees/shop/:shopId received:', req.params);
  const { shopId } = req.params;

  try {
    // ตรวจสอบว่ามีร้านค้านี้อยู่จริงหรือไม่
    const shop = await Shop.findOne({ where: { id: shopId } });
    if (!shop) {
      return res.status(404).json({ message: 'ไม่พบร้านค้า' });
    }

    const employees = await Employee.findAll({
      where: { shop_id: shopId },
      include: [{ model: EmployeeRole, as: 'roles', attributes: ['role'] }],
    });

    // แปลงข้อมูลให้อยู่ในรูปแบบที่ frontend ต้องการ
    const formattedEmployees = employees.map(employee => {
      const roles = employee.roles ? employee.roles.map(r => r.role) : [];
      return {
        ...employee.toJSON(),
        roles
      };
    });

    res.status(200).json(formattedEmployees);
  } catch (error) {
    console.error('Error fetching employees for shop:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงรายชื่อพนักงาน', error: error.message });
  }
});

router.post('/', verifyToken, checkRole(['admin', 'Admin User']), async (req, res) => {
  console.log('POST /employees received:', req.body);
  const { shop_id, first_name, last_name, email, password, phone, roles, status } = req.body;

  try {
    // Debugging line to check shop_id type
    console.log('Shop ID type:', typeof shop_id, 'Value:', shop_id);

    const shop = await Shop.findOne({ where: { id: shop_id } });
    if (!shop) {
      return res.status(400).json({ message: 'ไม่พบร้านค้าด้วย shop_id นี้' });
    }

    const existingEmployee = await Employee.findOne({ where: { email } });
    if (existingEmployee) {
      return res.status(400).json({ message: 'อีเมลนี้มีอยู่ในระบบแล้ว' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const employee = await Employee.create({
      shop_id,
      first_name,
      last_name,
      email,
      password: hashedPassword,
      phone,
      status: status || 'ACTIVE',
    });

    if (roles && roles.length > 0) {
      const roleRecords = roles.map((role) => ({ employee_id: employee.id, role }));
      await EmployeeRole.bulkCreate(roleRecords);
    }

    res.status(201).json({ message: 'สร้างพนักงานเรียบร้อย', id: employee.id });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสร้างพนักงาน', error: error.message });
  }
});

router.put('/:id', verifyToken, checkRole(['admin', 'Admin User']), async (req, res) => {
  console.log('PUT /employees/:id received:', req.params, req.body);
  const { id } = req.params;
  const { first_name, last_name, email, phone, roles, status } = req.body;

  try {
    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res.status(404).json({ message: 'ไม่พบพนักงาน' });
    }

    await employee.update({
      first_name,
      last_name,
      email,
      phone,
      status: status || 'ACTIVE',
    });

    if (roles) {
      await EmployeeRole.destroy({ where: { employee_id: id } });
      if (roles.length > 0) {
        const roleRecords = roles.map((role) => ({ employee_id: id, role }));
        await EmployeeRole.bulkCreate(roleRecords);
      }
    }

    res.status(200).json({ message: 'อัปเดตพนักงานเรียบร้อย' });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตพนักงาน', error: error.message });
  }
});

router.get('/:id', verifyToken, checkRole(['admin', 'Admin User']), async (req, res) => {
  console.log('GET /employees/:id received:', req.params);
  const { id } = req.params;

  try {
    const employee = await Employee.findByPk(id, {
      include: [{ model: EmployeeRole, as: 'roles', attributes: ['role'] }],
    });

    if (!employee) {
      return res.status(404).json({ message: 'ไม่พบพนักงาน' });
    }

    const roles = employee.roles ? employee.roles.map((r) => r.role) : [];
    res.status(200).json({ ...employee.toJSON(), roles });
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลพนักงาน', error: error.message });
  }
});

// เพิ่ม route สำหรับลบพนักงาน (ถ้าต้องการ)
router.delete('/:id', verifyToken, checkRole(['admin', 'Admin User']), async (req, res) => {
  console.log('DELETE /employees/:id received:', req.params);
  const { id } = req.params;

  try {
    const employee = await Employee.findByPk(id);
    if (!employee) {
      return res.status(404).json({ message: 'ไม่พบพนักงาน' });
    }

    // ลบ roles ที่เกี่ยวข้องก่อน
    await EmployeeRole.destroy({ where: { employee_id: id } });
    
    // ลบพนักงาน
    await employee.destroy();

    res.status(200).json({ message: 'ลบพนักงานเรียบร้อย' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบพนักงาน', error: error.message });
  }
});

export default router;