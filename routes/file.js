import express from 'express';
import path from 'path';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/upload', verifyToken, (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ message: 'No files were uploaded' });
  }

  const file = req.files.file;
  const uploadPath = path.join(__dirname, '../uploads', file.name);

  file.mv(uploadPath, (err) => {
    if (err) {
      return res.status(500).json({ message: 'File upload failed', error: err });
    }
    res.json({ message: 'File uploaded successfully', fileName: file.name });
  });
});

export default router;