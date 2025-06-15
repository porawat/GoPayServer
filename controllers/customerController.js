// customerController.js
import db from '../db/index.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const { Customer, Shop, CustomerShops } = db;

const createCustomer = async (req, res) => {
  try {
    const { name, email, phone, password, address, shop_id } = req.body;
    const id = uuidv4();

    // ตรวจสอบฟิลด์ที่บังคับ
    if (!name || !phone || !password || !shop_id) {
      return res.status(400).json({
        code: 4000,
        message: 'กรุณากรอกชื่อ, เบอร์โทร, รหัสผ่าน และรหัสร้านค้า',
      });
    }

    // ตรวจสอบรูปแบบเบอร์โทร
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        code: 4001,
        message: 'เบอร์โทรต้องเป็นตัวเลข 10 หลัก',
      });
    }

    // ตรวจสอบความยาวและรูปแบบรหัสผ่าน
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        code: 4002,
        message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร รวมตัวอักษรและตัวเลข',
      });
    }

    // ตรวจสอบรูปแบบอีเมล (ถ้ามี)
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        code: 4003,
        message: 'รูปแบบอีเมลไม่ถูกต้อง',
      });
    }

    // ตรวจสอบว่า phone ไม่ซ้ำ
    const existingCustomer = await Customer.findOne({ where: { phone, deleted_at: null } });
    if (existingCustomer) {
      return res.status(400).json({
        code: 4004,
        message: 'เบอร์โทรนี้ถูกใช้แล้ว',
      });
    }

    // ตรวจสอบว่า shop_id มีอยู่ในตาราง Shop
    const shopExists = await Shop.findOne({ where: { id: shop_id, deleted_at: null } });
    if (!shopExists) {
      return res.status(404).json({
        code: 4005,
        message: 'ไม่พบร้านค้าด้วยรหัสนี้',
      });
    }

    // เข้ารหัสรหัสผ่าน
    const saltRounds = 10;
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, saltRounds);
    } catch (bcryptError) {
      console.error('ข้อผิดพลาดในการเข้ารหัสรหัสผ่าน:', {
        message: bcryptError.message,
        stack: bcryptError.stack,
      });
      return res.status(500).json({
        code: 5001,
        message: 'ข้อผิดพลาดในการเข้ารหัสรหัสผ่าน',
        error: bcryptError.message,
      });
    }

    // บันทึกข้อมูลลูกค้า
    const newCustomer = await Customer.create({
      id,
      name,
      email: email || null,
      phone,
      password: hashedPassword,
      address: address || null,
      created_at: new Date(),
      updated_at: new Date(),
    }).catch((dbError) => {
      console.error('ข้อผิดพลาดในการบันทึกข้อมูลลูกค้า:', {
        message: dbError.message,
        stack: dbError.stack,
        name: dbError.name,
        sql: dbError.sql,
      });
      if (dbError.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          code: 4004,
          message: 'อีเมลหรือเบอร์โทรนี้ถูกใช้แล้ว',
        });
      }
      if (dbError.name === 'SequelizeDatabaseError') {
        return res.status(500).json({
          code: 5002,
          message: 'ข้อผิดพลาดในฐานข้อมูล: โครงสร้างตารางไม่สอดคล้อง',
        });
      }
      throw dbError;
    });

    // บันทึกความสัมพันธ์ใน CustomerShops
    if (newCustomer) {
      await CustomerShops.create({
        customer_id: newCustomer.id,
        shop_id: shop_id,
        status: 'PENDING',
        is_active: 'ACTIVE',
        created_at: new Date(),
        updated_at: new Date(),
      }).catch((dbError) => {
        console.error('ข้อผิดพลาดในการบันทึก CustomerShops:', {
          message: dbError.message,
          stack: dbError.stack,
          name: dbError.name,
          sql: dbError.sql,
        });
        throw new Error('Failed to create CustomerShops record');
      });
    }

    return res.status(201).json({
      code: 1000,
      message: 'ลงทะเบียนลูกค้าสำเร็จ รอการอนุมัติจากเจ้าของร้าน',
      data: {
        id: newCustomer.id,
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        shop_id,
        status: 'PENDING',
        created_at: newCustomer.created_at,
      },
    });
  } catch (error) {
    console.error('ข้อผิดพลาดในการเพิ่มลูกค้า:', {
      message: error.message,
      stack: error.stack,
      requestBody: req.body,
      errorName: error.name,
    });
    return res.status(500).json({
      code: 5000,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
};

const loginCustomer = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // ตรวจสอบฟิลด์ที่บังคับ
    if (!phone || !password) {
      return res.status(400).json({
        code: 4007,
        message: 'กรุณากรอกเบอร์โทรและรหัสผ่าน',
      });
    }

    // ตรวจสอบรูปแบบเบอร์โทร
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        code: 4001,
        message: 'เบอร์โทรต้องเป็นตัวเลข 10 หลัก',
      });
    }

    // ค้นหาลูกค้า
    const customerData = await Customer.findOne({
      where: { phone, deleted_at: null },
      include: [{
        model: CustomerShops,
        as: 'customer_shops',
        where: { is_active: 'ACTIVE', deleted_at: null },
        required: true,
      }],
    }).catch((err) => {
      console.error('ข้อผิดพลาดในการค้นหาลูกค้า:', {
        message: err.message,
        stack: err.stack,
        sql: err.sql,
        requestBody: req.body,
      });
      throw new Error('Database query error: customer login');
    });

    if (!customerData) {
      return res.status(401).json({
        code: 4010,
        message: 'เบอร์โทรไม่ถูกต้องหรือไม่มีอยู่ในระบบ',
      });
    }

    // ตรวจสอบสถานะ
    const customerShop = customerData.customer_shops[0];
    if (customerShop.status !== 'APPROVED') {
      return res.status(403).json({
        code: 4031,
        message: 'บัญชีนี้ยังไม่ได้รับการอนุมัติ',
      });
    }

    // ตรวจสอบรหัสผ่าน
    const isPasswordValid = await bcrypt.compare(password, customerData.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        code: 4011,
        message: 'รหัสผ่านไม่ถูกต้อง',
      });
    }

    // สร้าง JWT token
    const token = jwt.sign(
      { customerId: customerData.id, phone: customerData.phone, role: 'customer' },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      code: 1000,
      message: 'เข้าสู่ระบบสำเร็จ',
      data: {
        token,
        customerId: customerData.id,
        name: customerData.name,
        phone: customerData.phone,
        email: customerData.email,
        status: customerShop.status,
      },
    });
  } catch (error) {
    console.error('ข้อผิดพลาดในการ login ลูกค้า:', {
      message: error.message,
      stack: error.stack,
      requestBody: req.body,
      errorName: error.name,
    });
    return res.status(500).json({
      code: 5000,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
};

const getCustomer = async (req, res) => {
  const id = req.params.id;

  try {
    const customerData = await Customer.findOne({
      where: { id, deleted_at: null },
      include: [{
        model: CustomerShops,
        as: 'customer_shops',
        where: { is_active: 'ACTIVE', deleted_at: null },
        attributes: ['shop_id', 'status', 'is_active', 'created_at', 'updated_at'],
        required: false, // ใช้ LEFT JOIN เพื่อให้ได้ข้อมูลลูกค้าแม้ไม่มี CustomerShops
      }],
    });

    if (!customerData) {
      return res.status(404).json({
        code: 5404,
        message: 'ไม่พบข้อมูลลูกค้าหรือคุณไม่มีสิทธิ์เข้าถึง',
      });
    }

    return res.status(200).json({
      code: 1000,
      message: 'ดึงข้อมูลลูกค้าสำเร็จ',
      data: {
        id: customerData.id,
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        address: customerData.address,
        shop_id: customerData.customer_shops[0]?.shop_id || null,
        status: customerData.customer_shops[0]?.status || null,
        created_at: customerData.created_at,
        updated_at: customerData.updated_at,
      },
    });
  } catch (error) {
    console.error('ข้อผิดพลาดในการดึงข้อมูลลูกค้า:', {
      message: error.message,
      stack: error.stack,
      sql: error.sql,
    });
    return res.status(500).json({
      code: 5000,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
};

const getAllcustomer = async (req, res) => {
  const shop_id = req.params.shop_id;
  const user_id = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    if (!db.CustomerShops) {
      throw new Error('โมเดล CustomerShops ไม่ได้ถูกกำหนด');
    }

    if (req.user.role !== 'admin') {
      const shopExists = await Shop.findOne({
        where: { id: shop_id, user_id, deleted_at: null },
      });
      if (!shopExists) {
        return res.status(403).json({
          code: 4030,
          message: 'คุณไม่มีสิทธิ์เข้าถึงร้านค้านี้',
        });
      }
    }

    const customers = await CustomerShops.findAndCountAll({
      where: {
        shop_id,
        is_active: 'ACTIVE',
        deleted_at: null,
      },
      include: [{
        model: Customer,
        as: 'customer',
        where: { deleted_at: null },
        required: true,
        attributes: ['id', 'name', 'email', 'phone', 'created_at'],
      }],
      attributes: ['status', 'created_at'],
      order: [['created_at', 'DESC']],
      limit,
      offset: (page - 1) * limit,
    });

    return res.status(200).json({
      code: 1000,
      message: 'ดึงข้อมูลลูกค้าสำเร็จ',
      data: customers.rows.map((customerShop) => ({
        id: customerShop.customer.id,
        name: customerShop.customer.name,
        email: customerShop.customer.email,
        phone: customerShop.customer.phone,
        status: customerShop.status,
        created_at: customerShop.customer.created_at,
      })),
      pagination: {
        totalPages: Math.ceil(customers.count / limit),
        currentPage: page,
        totalItems: customers.count,
      },
    });
  } catch (error) {
    console.error('ข้อผิดพลาดในการดึงข้อมูลลูกค้า:', {
      message: error.message,
      stack: error.stack,
      sql: error.sql,
    });
    return res.status(500).json({
      code: 5000,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
};

const updateCustomer = async (req, res) => {
  const id = req.params.id;
  const { name, email, phone, password, address } = req.body;
  const customerId = req.user.customerId;

  try {
    const customerData = await Customer.findOne({
      where: { id, deleted_at: null },
      include: [{
        model: CustomerShops,
        as: 'customer_shops',
        where: { status: 'APPROVED', is_active: 'ACTIVE', deleted_at: null },
        required: true,
      }],
    });

    if (!customerData) {
      return res.status(404).json({
        code: 4004,
        message: 'ไม่พบข้อมูลลูกค้าหรือบัญชีนี้ไม่ได้รับการอนุมัติ',
      });
    }

    if (customerId !== id) {
      return res.status(403).json({
        code: 4032,
        message: 'คุณไม่มีสิทธิ์แก้ไขข้อมูลของผู้ใช้นี้',
      });
    }

    if (!name || !phone) {
      return res.status(400).json({
        code: 4000,
        message: 'กรุณากรอกชื่อและเบอร์โทร',
      });
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        code: 4001,
        message: 'เบอร์โทรต้องเป็นตัวเลข 10 หลัก',
      });
    }

    if (phone !== customerData.phone) {
      const existingCustomer = await Customer.findOne({ where: { phone, deleted_at: null } });
      if (existingCustomer) {
        return res.status(400).json({
          code: 4004,
          message: 'เบอร์โทรนี้ถูกใช้แล้ว',
        });
      }
    }

    let hashedPassword = customerData.password;
    if (password) {
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          code: 4002,
          message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร รวมตัวอักษรและตัวเลข',
        });
      }
      const saltRounds = 10;
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        code: 4003,
        message: 'รูปแบบอีเมลไม่ถูกต้อง',
      });
    }

    await Customer.update(
      {
        name,
        email: email || null,
        phone,
        password: hashedPassword,
        address: address || null,
        updated_at: new Date(),
      },
      { where: { id } }
    );

    return res.status(200).json({
      code: 1000,
      message: 'อัปเดตข้อมูลลูกค้าสำเร็จ',
    });
  } catch (error) {
    console.error('ข้อผิดพลาดในการอัปเดตข้อมูลลูกค้า:', {
      message: error.message,
      stack: error.stack,
      sql: error.sql,
    });
    return res.status(500).json({
      code: 5000,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
};

const deleteCustomer = async (req, res) => {
  const id = req.params.id;
  const customerId = req.user.customerId;

  try {
    const customerData = await Customer.findOne({ where: { id, deleted_at: null } });

    if (!customerData) {
      return res.status(404).json({
        code: 5404,
        message: 'ไม่พบข้อมูลลูกค้าหรือคุณไม่มีสิทธิ์เข้าถึง',
      });
    }

    if (customerId !== id) {
      return res.status(403).json({
        code: 4032,
        message: 'คุณไม่มีสิทธิ์ลบข้อมูลของผู้ใช้นี้',
      });
    }

    await Customer.update(
      { deleted_at: new Date() },
      { where: { id } }
    );

    await CustomerShops.update(
      { is_active: 'INACTIVE', deleted_at: new Date() },
      { where: { customer_id: id } }
    );

    return res.status(200).json({
      code: 1000,
      message: 'ลบข้อมูลลูกค้าสำเร็จ',
    });
  } catch (error) {
    console.error('ข้อผิดพลาดในการลบข้อมูลลูกค้า:', {
      message: error.message,
      stack: error.stack,
      sql: error.sql,
    });
    return res.status(500).json({
      code: 5000,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
};

const approveCustomer = async (req, res) => {
  const { id, shop_id } = req.body;

  try {
    const customerData = await CustomerShops.findOne({
      where: { customer_id: id, shop_id, status: 'PENDING', is_active: 'ACTIVE', deleted_at: null },
    });

    if (!customerData) {
      return res.status(404).json({
        code: 5404,
        message: 'ไม่พบข้อมูลลูกค้าที่รอการอนุมัติ',
      });
    }

    await CustomerShops.update(
      { status: 'APPROVED', updated_at: new Date() },
      { where: { customer_id: id, shop_id } }
    );

    return res.status(200).json({
      code: 1000,
      message: 'อนุมัติลูกค้าสำเร็จ',
    });
  } catch (error) {
    console.error('ข้อผิดพลาดในการอนุมัติลูกค้า:', {
      message: error.message,
      stack: error.stack,
      sql: error.sql,
    });
    return res.status(500).json({
      code: 5000,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
};

const rejectCustomer = async (req, res) => {
  const { id, shop_id } = req.body;

  try {
    const customerData = await CustomerShops.findOne({
      where: { customer_id: id, shop_id, status: 'PENDING', is_active: 'ACTIVE', deleted_at: null },
    });

    if (!customerData) {
      return res.status(404).json({
        code: 5404,
        message: 'ไม่พบข้อมูลลูกค้าที่รอการอนุมัติ',
      });
    }

    await CustomerShops.update(
      { status: 'REJECTED', is_active: 'INACTIVE', updated_at: new Date(), deleted_at: new Date() },
      { where: { customer_id: id, shop_id } }
    );

    return res.status(200).json({
      code: 1000,
      message: 'ปฏิเสธลูกค้าสำเร็จ',
    });
  } catch (error) {
    console.error('ข้อผิดพลาดในการปฏิเสธลูกค้า:', {
      message: error.message,
      stack: error.stack,
      sql: error.sql,
    });
    return res.status(500).json({
      code: 5000,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
};

const getPendingCustomers = async (req, res) => {
  const { shop_id } = req.params;
  const user_id = req.user.id;

  try {
    const shopExists = await Shop.findOne({
      where: { id: shop_id, user_id, deleted_at: null },
    });
    if (!shopExists) {
      return res.status(403).json({
        code: 4030,
        message: 'คุณไม่มีสิทธิ์เข้าถึงร้านค้านี้',
      });
    }

    const customers = await CustomerShops.findAll({
      where: { shop_id, status: 'PENDING', is_active: 'ACTIVE', deleted_at: null },
      include: [{
        model: Customer,
        as: 'customer',
        where: { deleted_at: null },
        attributes: ['id', 'name', 'email', 'phone', 'created_at'],
      }],
    });

    return res.status(200).json({
      code: 1000,
      message: 'ดึงข้อมูลลูกค้าที่รอการอนุมัติสำเร็จ',
      data: customers.map((c) => ({
        id: c.customer.id,
        name: c.customer.name,
        email: c.customer.email,
        phone: c.customer.phone,
        shop_id: c.shop_id,
        status: c.status,
        created_at: c.customer.created_at,
      })),
    });
  } catch (error) {
    console.error('ข้อผิดพลาดในการดึงข้อมูลลูกค้าที่รอการอนุมัติ:', {
      message: error.message,
      stack: error.stack,
      sql: error.sql,
    });
    return res.status(500).json({
      code: 5000,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
};

const changeCustomerPassword = async (req, res) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;
  const customerId = req.user.customerId;

  try {
    if (customerId !== id) {
      return res.status(403).json({
        code: 4032,
        message: 'คุณไม่มีสิทธิ์เปลี่ยนรหัสผ่านของผู้ใช้นี้',
      });
    }

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        code: 4007,
        message: 'กรุณากรอกรหัสผ่านเก่าและรหัสผ่านใหม่',
      });
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        code: 4002,
        message: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร รวมตัวอักษรและตัวเลข',
      });
    }

    const customerData = await Customer.findOne({
      where: { id, deleted_at: null },
      include: [{
        model: CustomerShops,
        as: 'customer_shops',
        where: { status: 'APPROVED', is_active: 'ACTIVE', deleted_at: null },
        required: true,
      }],
    });

    if (!customerData) {
      return res.status(404).json({
        code: 4040,
        message: 'ไม่พบข้อมูลลูกค้าหรือบัญชีนี้ไม่ได้รับการอนุมัติ',
      });
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, customerData.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        code: 4011,
        message: 'รหัสผ่านเก่าไม่ถูกต้อง',
      });
    }

    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    await Customer.update(
      {
        password: hashedNewPassword,
        updated_at: new Date(),
      },
      { where: { id } }
    );

    return res.status(200).json({
      code: 1000,
      message: 'เปลี่ยนรหัสผ่านสำเร็จ',
    });
  } catch (error) {
    console.error('ข้อผิดพลาดในการเปลี่ยนรหัสผ่าน:', {
      message: error.message,
      stack: error.stack,
      requestBody: req.body,
      sql: error.sql,
    });
    return res.status(500).json({
      code: 5000,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: error.message,
    });
  }
};

export {
  createCustomer,
  loginCustomer,
  getCustomer,
  getAllcustomer,
  updateCustomer,
  deleteCustomer,
  approveCustomer,
  rejectCustomer,
  getPendingCustomers,
  changeCustomerPassword,
};