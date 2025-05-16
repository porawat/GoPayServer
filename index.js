// index.js
import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import authRoutes from './routes/auth.js';
import fileRoutes from './routes/file.js';
import shopRoutes from './routes/shop.js';
import employeeRoutes from './routes/employee.js';
import db from './db/index.js';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { sequelize } = db;

// async function syncDatabase() {
//   try {
//     await sequelize.sync({ alter: true });
//     console.log('Database synchronized successfully.');
//   } catch (error) {
//     console.error('Error synchronizing database:', error);
//   }
// }
// syncDatabase();

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use('/files/uploads', express.static(path.join(__dirname, 'Uploads')));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

app.use('/', authRoutes);
app.use('/files', fileRoutes);
app.use('/shop', shopRoutes);
app.use('/employees', employeeRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});