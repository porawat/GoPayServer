// config/db.js
import { Sequelize } from 'sequelize';
import { config } from 'dotenv';
config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    pool: {
      max: 5,          // จำกัดการเชื่อมต่อสูงสุด
      min: 0,          // การเชื่อมต่อขั้นต่ำ
      acquire: 30000,  // เวลารอการเชื่อมต่อ (ms)
      idle: 10000      // เวลา idle ก่อนปิด connection (ms)
    },
    logging: false     // ปิด log เพื่อลด overhead
  }
);

export default sequelize;