// backend/routes/productmasterRouter.js
import express from 'express';
import { createProductMaster, getProductMasterList, getProductMasterById, createProduct } from '../controllers/productmasterController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', verifyToken, createProductMaster);
router.get('/', verifyToken, getProductMasterList);
router.get('/productsbycategory/:category_id', verifyToken, getProductMasterById);
router.post('/product', verifyToken, createProduct); // เพิ่ม route สำหรับ POST /product

export default router;