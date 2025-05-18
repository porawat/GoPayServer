import express from 'express';
import { getcategoryList } from '../controllers/categoryController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Log เพื่อ debug
router.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} UserID: ${req.user?.id}`);
    next();
});

router.get('/', verifyToken, getcategoryList);


export default router;