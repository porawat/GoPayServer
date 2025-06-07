// customerRouter.js
import express from 'express';
import {
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
} from '../controllers/customerController.js';
import { verifyToken } from '../middleware/auth.js';
import db from '../db/index.js'; // เพิ่ม import db

const router = express.Router();

// Middleware เพื่อตรวจสอบว่าเป็นเจ้าของร้านหรือ admin
const restrictToShopOwner = async (req, res, next) => {
    console.log("params ", req.params);
    console.log("user ", req.user);
    try {
        if (req.user.role === 'admin') {
            return next(); // Admin เข้าถึงได้ทุก shop_id
        }
        const shop = await db.shop.findOne({ where: { id: req.params.shop_id } });
        if (!shop || !req.user || shop.user_id !== req.user.id) {
            return res.status(403).json({
                code: 4030,
                message: 'คุณไม่มีสิทธิ์เข้าถึงร้านค้านี้',
            });
        }
        req.user.shopId = shop.id; // ตั้ง shopId ใน req.user
        next();
    } catch (error) {
        console.error('Error in restrictToShopOwner:', error);
        return res.status(500).json({
            code: 5000,
            message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
        });
    }
};

// Routes คงเดิม
router.post('/', createCustomer);
router.post('/login', loginCustomer);
router.get('/:id', getCustomer);
router.get('/all/:shop_id', verifyToken, restrictToShopOwner, getAllcustomer);
router.get('/pending/:shop_id', verifyToken, restrictToShopOwner, getPendingCustomers);
router.put('/:id', verifyToken, updateCustomer);
router.put('/:id/change-password', verifyToken, changeCustomerPassword);
router.delete('/:id', verifyToken, deleteCustomer);
router.post('/approve', verifyToken, restrictToShopOwner, approveCustomer);
router.post('/reject/:id', verifyToken, restrictToShopOwner, rejectCustomer);

export default router;