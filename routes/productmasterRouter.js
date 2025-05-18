// backend/routes/shop.js
import express from 'express';
import { createProductMaster, getProductMasterList } from '../controllers/productmasterController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', verifyToken, createProductMaster);
router.get('/', verifyToken, getProductMasterList);

export default router;