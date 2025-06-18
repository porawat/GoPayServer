// backend/routes/index.js
import express from 'express';
import { getWarehouses } from '../controllers/warehouseController.js';
import { getCategories } from '../controllers/categoryController.js';
import { getSuppliers } from '../controllers/supplierController.js';

const router = express.Router();

router.get('/warehouses', getWarehouses);
router.get('/category', getCategories);
router.get('/suppliers', getSuppliers);

export default router;