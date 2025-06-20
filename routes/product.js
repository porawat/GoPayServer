// backend/routes/product.js
import express from 'express';
import { getmyproduct, createProduct, updateProduct, deleteProduct, productDetail } from '../controllers/productController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/:shopId', verifyToken, getmyproduct);
router.post('/', verifyToken, createProduct);
router.put('/:productId', verifyToken, updateProduct);
router.delete('/:productId', verifyToken, deleteProduct);
router.get('/detail/:productId', verifyToken, productDetail);

export default router;