// backend/routes/shop.js
import express from 'express';
import { getmyshop, createshop, getShopById, updateShop } from '../controllers/shopController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Log เพื่อ debug
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} UserID: ${req.user?.id}`);
  next();
});

router.post('/getmyshop', verifyToken, getmyshop);
router.post('/createshop', verifyToken, createshop);
router.get('/:shopId', verifyToken, getShopById);
router.put('/updateshop/:shopId', verifyToken, updateShop);

export default router;