// backend/routes/shop.js
import express from 'express';
import { getmyproduct, createProduct } from '../controllers/productController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Log เพื่อ debug
router.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} `);
    next();
});

router.get('/:shopId', verifyToken, getmyproduct);
router.post('/', verifyToken, createProduct);


export default router;