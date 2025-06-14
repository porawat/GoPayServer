import express from 'express';
import { getmyproduct, createProduct, updateProduct, deleteProduct, productDetail } from '../controllers/productController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/:shopId', verifyToken, getmyproduct);
router.post('/', verifyToken, createProduct);
router.post('/update', verifyToken, updateProduct);
router.post('/delete', verifyToken, deleteProduct);
router.post('/productDetail', verifyToken, productDetail)

export default router;