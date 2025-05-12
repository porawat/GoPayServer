//routes/auth.js
import express from 'express';
import { login, getProfile, changePassword, updateProfile, getDashboard, getSettings, getmembers } from '../controllers/authController.js';
import { createshop, getmyshop, createshop2 } from '../controllers/shopController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.get('/profile', verifyToken, getProfile);
router.post('/change-password', verifyToken, changePassword);
router.put('/profile', verifyToken, updateProfile);
router.get('/dashboard', verifyToken, getDashboard);
router.get('/settings', verifyToken, getSettings);
router.get('/members', verifyToken, getmembers);
router.post('/createshop', verifyToken, createshop);
router.post('/createshop2', verifyToken, createshop2);
router.post('/getmyshop', verifyToken, getmyshop);

export default router;