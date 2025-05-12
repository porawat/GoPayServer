import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';
import authRoutes from './routes/auth.js';
import fileRoutes from './routes/file.js';
import db from './db/index.js';
config();

// คำนวณ __dirname ใน ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { sequelize } = db;
async function syncDatabase() {
  try {
    await sequelize.sync();
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing database:', error);
  }
}

syncDatabase();
const app = express();

app.use(cors());
app.use(express.json());
app.use(fileUpload());
app.use('/files/uploads', express.static(path.join(__dirname, 'Uploads')));

app.use('/', authRoutes);
app.use('/files', fileRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});