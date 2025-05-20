import express from 'express';
import {
    createCustomer,
    getCustomer,
    getAllcustomer,
    updateCustomer,
    deleteCustomer,
} from '../controllers/customerController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', verifyToken, createCustomer);
router.get('/:id', verifyToken, getCustomer);
router.get('/all/:shop_id', verifyToken, getAllcustomer);
router.put('/:id', verifyToken, updateCustomer);
router.delete('/:id', verifyToken, deleteCustomer);

export default router;