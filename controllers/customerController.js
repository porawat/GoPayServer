// customerController.js
import db from '../db/index.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const { customer, shop } = db;

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
        const existingCustomer = await customer.findOne({
            where: { phone, is_active: 'ACTIVE' },
        }).catch((err) => {
            console.error('ข้อผิดพลาดในการตรวจสอบเบอร์โทร:', err);
            throw new Error('Database query error: phone check');
        });
        if (existingCustomer) {
            return res.status(400).json({
                code: 4004,
                message: 'เบอร์โทรนี้ถูกใช้แล้ว',
            });
        }

        // ตรวจสอบว่า shop_id มีอยู่ในตาราง shop
        const shopExists = await shop.findOne({ where: { id: shop_id } }).catch((err) => {
            console.error('ข้อผิดพลาดในการตรวจสอบร้านค้า:', err);
            throw new Error('Database query error: shop check');
        });
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
            });
        }

        // บันทึกข้อมูลลูกค้า
        const newCustomer = await customer.create({
                id,
                name,
                email: email || null,
                phone,
                password: hashedPassword,
                address: address || null,
                shop_id,
                status: 'PENDING',
                is_active: 'ACTIVE',
                created_at: new Date(),
            }).catch((dbError) => {
                console.error('ข้อผิดพลาดในการบันทึกข้อมูลลูกค้า:', {
                    message: dbError.message,
                    stack: dbError.stack,
                    name: dbError.name,
                });
                if (dbError.name === 'SequelizeForeignKeyConstraintError') {
                    return res.status(400).json({
                        code: 4006,
                        message: 'รหัสร้านค้าไม่ถูกต้องหรือไม่สามารถเชื่อมโยงได้',
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

        return res.status(201).json({
            code: 1000,
            message: 'ลงทะเบียนลูกค้าสำเร็จ รอการอนุมัติจากเจ้าของร้าน',
            data: {
                id: newCustomer.id,
                name: newCustomer.name,
                email: newCustomer.email,
                phone: newCustomer.phone,
                shop_id: newCustomer.shop_id,
                status: newCustomer.status,
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
        const customerData = await customer.findOne({
            where: { phone, is_active: 'ACTIVE' },
        }).catch((err) => {
            console.error('ข้อผิดพลาดในการค้นหาลูกค้า:', err);
            throw new Error('Database query error: customer login');
        });

        if (!customerData) {
            return res.status(401).json({
                code: 4010,
                message: 'เบอร์โทรไม่ถูกต้องหรือไม่มีอยู่ในระบบ',
            });
        }

        // ตรวจสอบสถานะ
        if (customerData.status !== 'APPROVED') {
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
            process.env.JWT_SECRET || 'your_jwt_secret', // ควรใช้ env variable
            { expiresIn: '1d' } // หมดอายุใน 1 วัน
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
                status: customerData.status,
            },
        });
    } catch (error) {
        console.error('ข้อผิดพลาดในการ login ลูกค้า:', {
            message: error.message,
            stack: error.stack,
            requestBody: req.body,
        });
        return res.status(500).json({
            code: 5000,
            message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
        });
    }
};

const getCustomer = async (req, res) => {
    const id = req.params.id;

    try {
        const customerData = await customer.findOne({
            where: { id, is_active: 'ACTIVE' },
        });

        if (!customerData) {
            return res.status(404).json({
                code: 5404,
                message: 'ไม่พบข้อมูลลูกค้าหรือคุณไม่มีสิทธิ์เข้าถึง',
            });
        }

        return res.status(200).json({
            code: 1000,
            message: 'ด-driver licenseึงข้อมูลลูกค้าสำเร็จ',
            data: {
                id: customerData.id,
                name: customerData.name,
                email: customerData.email,
                phone: customerData.phone,
                address: customerData.address,
                shop_id: customerData.shop_id,
                status: customerData.status,
                is_active: customerData.is_active,
                created_at: customerData.created_at,
                updated_at: customerData.updated_at,
            },
        });
    } catch (error) {
        console.error('ข้อผิดพลาดในการดึงข้อมูลลูกค้า:', error);
        return res.status(500).json({
            code: 5000,
            message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
        });
    }
};

// customerController.js
const getAllcustomer = async (req, res) => {
    const shop_id = req.params.shop_id;
    const user_id = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
        if (req.user.role !== 'admin') {
            const shopExists = await shop.findOne({
                where: { id: shop_id, user_id },
            });
            if (!shopExists) {
                return res.status(403).json({
                    code: 4030,
                    message: 'คุณไม่มีสิทธิ์เข้าถึงร้านค้านี้',
                });
            }
        }

        const customers = await customer.findAndCountAll({
            where: {
                shop_id,
                is_active: 'ACTIVE',
            },
            limit,
            offset: (page - 1) * limit,
        });

        return res.status(200).json({
            code: 1000,
            message: 'ดึงข้อมูลลูกค้าสำเร็จ',
            data: customers.rows.map((c) => ({
                id: c.id,
                name: c.name,
                email: c.email,
                phone: c.phone,
                address: c.address,
                shop_id: c.shop_id,
                status: c.status,
                is_active: c.is_active,
                created_at: c.created_at,
                updated_at: c.updated_at,
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
        });
        return res.status(500).json({
            code: 5000,
            message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
        });
    }
};

const updateCustomer = async (req, res) => {
    const id = req.params.id;
    const { name, email, phone, password, address } = req.body;
    const customerId = req.user.customerId;

    try {
        const customerData = await customer.findOne({
            where: { id, is_active: 'ACTIVE', status: 'APPROVED' },
        });

        if (!customerData) {
            return res.status(404).json({
                code: 4004,
                message: 'ไม่พบข้อมูลลูกค้าหรือบัญชีนี้ไม่ได้รับการอนุมัติ',
            });
        }

        // ตรวจสอบว่าเป็นเจ้าของบัญชี
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
            const existingCustomer = await customer.findOne({
                where: { phone, is_active: 'ACTIVE' },
            });
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

        await customer.update(
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
        console.error('ข้อผิดพลาดในการอัปเดตข้อมูลลูกค้า:', error);
        return res.status(500).json({
            code: 5000,
            message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
        });
    }
};

const deleteCustomer = async (req, res) => {
    const id = req.params.id;
    const customerId = req.user.customerId;

    try {
        const customerData = await customer.findOne({
            where: { id, is_active: 'ACTIVE' },
        });

        if (!customerData) {
            return res.status(404).json({
                code: 5404,
                message: 'ไม่พบข้อมูลลูกค้าหรือคุณไม่มีสิทธิ์เข้าถึง',
            });
        }

        // ตรวจสอบว่าเป็นเจ้าของบัญชี
        if (customerId !== id) {
            return res.status(403).json({
                code: 4032,
                message: 'คุณไม่มีสิทธิ์ลบข้อมูลของผู้ใช้นี้',
            });
        }

        await customer.update(
            {
                is_active: 'INACTIVE',
                deleted_at: new Date(),
            },
            { where: { id } }
        );

        return res.status(200).json({
            code: 1000,
            message: 'ลบข้อมูลลูกค้าสำเร็จ',
        });
    } catch (error) {
        console.error('ข้อผิดพลาดในการลบข้อมูลลูกค้า:', error);
        return res.status(500).json({
            code: 5000,
            message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
        });
    }
};

const approveCustomer = async (req, res) => {
    const { id } = req.params;
    try {
        const customerData = await customer.findOne({
            where: { id, status: 'PENDING', is_active: 'ACTIVE' },
        });
        if (!customerData) {
            return res.status(404).json({
                code: 5404,
                message: 'ไม่พบข้อมูลลูกค้าที่รอการอนุมัติ',
            });
        }
        await customer.update(
            { status: 'APPROVED', updated_at: new Date() },
            { where: { id } }
        );
        return res.status(200).json({
            code: 1000,
            message: 'อนุมัติลูกค้าสำเร็จ',
        });
    } catch (error) {
        console.error('ข้อผิดพลาดในการอนุมัติลูกค้า:', error);
        return res.status(500).json({
            code: 5000,
            message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
        });
    }
};

const rejectCustomer = async (req, res) => {
    const { id } = req.params;
    try {
        const customerData = await customer.findOne({
            where: { id, status: 'PENDING', is_active: 'ACTIVE' },
        });
        if (!customerData) {
            return res.status(404).json({
                code: 5404,
                message: 'ไม่พบข้อมูลลูกค้าที่รอการอนุมัติ',
            });
        }
        await customer.update(
            { status: 'REJECTED', is_active: 'INACTIVE', updated_at: new Date(), deleted_at: new Date() },
            { where: { id } }
        );
        return res.status(200).json({
            code: 1000,
            message: 'ปฏิเสธลูกค้าสำเร็จ',
        });
    } catch (error) {
        console.error('ข้อผิดพลาดในการปฏิเสธลูกค้า:', error);
        return res.status(500).json({
            code: 5000,
            message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
        });
    }
};

const getPendingCustomers = async (req, res) => {
    const { shop_id } = req.params;
    const user_id = req.user.id; // ดึงจาก middleware

    try {
        // ตรวจสอบว่า shop_id ตรงกับ user_id
        const shopExists = await shop.findOne({
            where: {
                id: shop_id,
                user_id,
            },
        });
        if (!shopExists) {
            return res.status(403).json({
                code: 4030,
                message: 'คุณไม่มีสิทธิ์เข้าถึงร้านค้านี้',
            });
        }
        const customers = await customer.findAll({
            where: { shop_id, status: 'PENDING', is_active: 'ACTIVE' },
        });
        return res.status(200).json({
            code: 1000,
            message: 'ดึงข้อมูลลูกค้าที่รอการอนุมัติสำเร็จ',
            data: customers.map((c) => ({
                id: c.id,
                name: c.name,
                email: c.email,
                phone: c.phone,
                shop_id: c.shop_id,
                status: c.status,
                created_at: c.created_at,
            })),
        });
    } catch (error) {
        console.error('ข้อผิดพลาดในการดึงข้อมูลลูกค้าที่รอการอนุมัติ:', error);
        return res.status(500).json({
            code: 5000,
            message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
        });
    }
};

const changeCustomerPassword = async (req, res) => {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;
    const customerId = req.user.customerId;

    try {
        // ตรวจสอบว่า customerId จาก token ตรงกับ id ใน params
        if (customerId !== id) {
            return res.status(403).json({
                code: 4032,
                message: 'คุณไม่มีสิทธิ์เปลี่ยนรหัสผ่านของผู้ใช้นี้',
            });
        }

        // ตรวจสอบฟิลด์ที่บังคับ
        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                code: 4007,
                message: 'กรุณากรอกรหัสผ่านเก่าและรหัสผ่านใหม่',
            });
        }

        // ตรวจสอบความยาวและรูปแบบรหัสผ่านใหม่
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                code: 4002,
                message: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร รวมตัวอักษรและตัวเลข',
            });
        }

        // ค้นหาลูกค้า
        const customerData = await customer.findOne({
            where: { id, is_active: 'ACTIVE', status: 'APPROVED' },
        });

        if (!customerData) {
            return res.status(404).json({
                code: 4040,
                message: 'ไม่พบข้อมูลลูกค้าหรือบัญชีนี้ไม่ได้รับการอนุมัติ',
            });
        }

        // ตรวจสอบรหัสผ่านเก่า
        const isPasswordValid = await bcrypt.compare(oldPassword, customerData.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                code: 4011,
                message: 'รหัสผ่านเก่าไม่ถูกต้อง',
            });
        }

        // เข้ารหัสรหัสผ่านใหม่
        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // อัปเดตรหัสผ่าน
        await customer.update(
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
        });
        return res.status(500).json({
            code: 5000,
            message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
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