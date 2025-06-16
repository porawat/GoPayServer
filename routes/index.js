import express from 'express';
import { getWarehouses } from '../controllers/warehouseController.js';
import { getCategories } from '../controllers/categoryController.js';
import { getSuppliers } from '../controllers/supplierController.js';
import { getmyproduct, createProduct, updateProduct, deleteProduct, productDetail } from '../controllers/productController.js';

const router = express.Router();

router.get('/warehouses', getWarehouses);
router.get('/category', getCategories);
router.get('/suppliers', getSuppliers);
router.get('/products/:shopId', getmyproduct);
router.post('/products', createProduct);
router.put('/products', updateProduct);
router.delete('/products', deleteProduct);
router.post('/products/detail', productDetail);

export default router;