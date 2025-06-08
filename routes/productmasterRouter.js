// backend/routes/shop.js
import express from 'express';
import { createProductMaster, getProductMasterList, getProductMasterbyId } from '../controllers/productmasterController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', verifyToken, createProductMaster);
router.get('/', verifyToken, getProductMasterList);
router.get('/productsbycategory/:category_id', verifyToken, getProductMasterbyId);

export default router;