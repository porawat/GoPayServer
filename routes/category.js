import express from 'express';
import { getcategoryList } from '../controllers/categoryController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyToken, getcategoryList);


export default router;