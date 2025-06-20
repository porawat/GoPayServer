import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import authRoutes from './routes/auth.js';
import fileRoutes from './routes/file.js';
import shopRoutes from './routes/shop.js';
import productRoutes from './routes/product.js';
import productMasterRouter from './routes/productmasterRouter.js';
import employeeRoutes from './routes/employee.js';
import categoryRoutes from './routes/category.js';
import customerRoutes from './routes/customerRouter.js';
import supplierRouter from  './routes/suppliersRouter.js'
import db from './db/index.js';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { sequelize } = db;

async function syncDatabase() {
  try {
    console.log('Starting database synchronization...');
    await sequelize.sync({ force: false, alter: process.env.NODE_ENV === 'development' });
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing database:', error);
    process.exit(1);
  }
}

syncDatabase();

const app = express();

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL :
   ['http://localhost:5173', 'http://localhost:3030'],
  optionsSuccessStatus: 200,
};
app.use(cors());

app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

app.use('/', authRoutes);
app.use('/files', fileRoutes);
app.use('/shop', shopRoutes);
app.use('/employees', employeeRoutes);
app.use('/product', productRoutes);
app.use('/productmaster', productMasterRouter);
app.use('/category', categoryRoutes);
app.use('/customer', customerRoutes);
app.use('/supplier',supplierRouter)

app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});