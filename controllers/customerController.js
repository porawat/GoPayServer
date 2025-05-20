import { Sequelize } from 'sequelize';
import db from '../db/index.js';
import { v4 as uuidv4 } from 'uuid';

const { customer } = db;

const createCustomer = async (req, res) => {
    try {
        const { name, email, phone, address, shop_id } = req.body;
        const id = uuidv4();
        if (!name || !shop_id) {
            return res.status(500).json({
                code: 5000,
                message: 'กรุณากรอกข้อมูลให้ครบถ้วน',
            });
        }
        const newCustomer = await customer.create({
            id: id,
            name,
            email,
            phone,
            address,
            shop_id,
        });

        return res.status(201).json({
            code: 1000,
            message: 'เพิ่มลูกค้าสำเร็จ',
            data: newCustomer,
        });
    } catch (error) {
        console.error('ข้อผิดพลาดในการเพิ่มลูกค้า:', error);
        return res.status(500).json({
            code: 5000,
            message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
        });
    }
}
const getCustomer = async (req, res) => {
    const id = req.params.id;

    try {
        const customerData = await customer.findOne({
            where: { id: id },
        });

        if (!customerData) {
            return res.status(404).json({
                code: 5404,
                message: 'ไม่พบข้อมูลลูกค้า',
            });
        }

        return res.status(200).json({
            code: 1000,
            message: 'ดึงข้อมูลลูกค้าสำเร็จ',
            data: customerData,
        });
    } catch (error) {
        console.error('ข้อผิดพลาดในการดึงข้อมูลลูกค้า:', error);
        return res.status(500).json({
            code: 5000,
            message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
        });
    }
}
const getAllcustomer = async (req, res) => {
    const shop_id = req.params.shop_id;
    try {
        const customers = await customer.findAll({
            where: {
                shop_id: shop_id,

            },
        });

        return res.status(200).json({
            code: 1000,
            message: 'ดึงข้อมูลลูกค้าสำเร็จ',
            data: customers || [],
        });
    } catch (error) {
        console.error('ข้อผิดพลาดในการดึงข้อมูลลูกค้า:', error);
        return res.status(500).json({
            code: 5000,
            message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
        });
    }
}
const updateCustomer = async (req, res) => {
    const id = req.params.id;
    const { name, email, phone, address } = req.body;

    try {
        const customerData = await customer.findOne({
            where: { id: id },
        });

        if (!customerData) {
            return res.status(404).json({
                code: 4004,
                message: 'ไม่พบข้อมูลลูกค้า',
            });
        }

        await customer.update(
            { name, email, phone, address },
            { where: { id: id } }
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
}
const deleteCustomer = async (req, res) => {
    const id = req.params.id;

    try {
        const customerData = await customer.findOne({
            where: { id: id },
        });

        if (!customerData) {
            return res.status(404).json({
                code: 5404,
                message: 'ไม่พบข้อมูลลูกค้า',
            });
        }

        await customer.update(
            {
                is_active: 'INACTIVE',
                deleted_at: new Date(),
            },
            {
                where: { id: id }
            }
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
}
export {
    createCustomer,
    getCustomer,
    getAllcustomer,
    updateCustomer,
    deleteCustomer,
}

