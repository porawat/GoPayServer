import express from 'express';
import {
    createCustomer,
    getCustomer,
    getAllcustomer,
    updateCustomer,
    deleteCustomer,
    approveCustomer,
    rejectCustomer,
    getPendingCustomers,
} from '../controllers/customerController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Middleware เพื่อตรวจสอบว่าเป็นเจ้าของร้าน
const restrictToShopOwner = (req, res, next) => {
    if (!req.user || !req.user.shopId || req.user.shopId !== req.params.shop_id) {
        return res.status(403).json({
            code: 4030,
            message: 'คุณไม่มีสิทธิ์เข้าถึงร้านค้านี้',
        });
    }
    next();
};

// สร้างลูกค้า (ไม่ต้องตรวจสอบ token)
router.post('/', createCustomer);

// ดึงข้อมูลลูกค้าโดย ID (ไม่ต้องตรวจสอบ token เพื่อรองรับ PendingApproval)
router.get('/:id', getCustomer);

// ดึงลูกค้าทั้งหมดของร้าน (ต้องล็อกอินและเป็นเจ้าของร้าน)
router.get('/all/:shop_id', verifyToken, restrictToShopOwner, getAllcustomer);

// ดึงลูกค้าที่รอการอนุมัติ (ต้องล็อกอินและเป็นเจ้าของร้าน)
router.get('/pending/:shop_id', verifyToken, restrictToShopOwner, getPendingCustomers);

// อัปเดตข้อมูลลูกค้า (ต้องล็อกอิน)
router.put('/:id', verifyToken, updateCustomer);

// ลบลูกค้า (ต้องล็อกอิน)
router.delete('/:id', verifyToken, deleteCustomer);

// อนุมัติลูกค้า (ต้องล็อกอินและเป็นเจ้าของร้าน)
router.post('/approve/:id', verifyToken, restrictToShopOwner, approveCustomer);

// ปฏิเสธลูกค้า (ต้องล็อกอินและเป็นเจ้าของร้าน)
router.post('/reject/:id', verifyToken, restrictToShopOwner, rejectCustomer);

export default router;