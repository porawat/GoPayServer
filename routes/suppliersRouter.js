import express from 'express';
import { getSuppliers} from '../controllers/supplierController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyToken, getSuppliers);



export default router;