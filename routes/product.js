// backend/routes/shop.js
import express from 'express';
import { getmyproduct, createProduct, createProductMaster } from '../controllers/productController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Log เพื่อ debug
router.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} UserID: ${req.user?.id}`);
    next();
});

router.get('/:shopId', verifyToken, getmyproduct);
router.post('/', verifyToken, createProduct);
router.post('/productmaster', verifyToken, createProductMaster);
// router.get('/:shopId', verifyToken, getShopById);
// router.put('/updateshop/:shopId', verifyToken, updateShop);

export default router;