//db/index.js
import { Sequelize } from 'sequelize';
import shopModel from './model/shop.js';
import employeeModel from './model/employee.js';
import employeeRoleModel from './model/employee_roles.js';
import userModel from './model/user.js';
import ProductMasterModel from './model/product_master.js';
import ProductModel from './model/product.js';
import categoryModel from './model/category.js';
import shopConfigModel from './model/shop_config.js'; // เพิ่มโมเดล shop_config
import customerModel from './model/customer.js'; // เพิ่มโมเดล customer
import customerShopModel from './model/customer_shop.js'; // เพิ่มโมเดล customer_shops
import { config } from 'dotenv';
config();

console.log('DB_NAME:', process.env.DB_NAME);

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    // เพิ่ม connection pool configuration
    pool: {
      max: 5,          // จำกัดการเชื่อมต่อสูงสุดที่ 5
      min: 0,          // การเชื่อมต่อขั้นต่ำ
      acquire: 30000,  // เวลารอการเชื่อมต่อ (30 วินาที)
      idle: 10000,     // เวลา idle ก่อนปิด connection (10 วินาที)
      evict: 5000      // ตรวจสอบ idle connections ทุก 5 วินาที
    },
    define: {
      timestamps: false,
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    // เพิ่ม retry configuration
    retry: {
      match: [
        /ConnectionError/,
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/
      ],
      max: 3
    }
  }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// กำหนดโมเดล
db.shop = shopModel(sequelize, Sequelize);
db.employee = employeeModel(sequelize, Sequelize);
db.employeeRole = employeeRoleModel(sequelize, Sequelize);
db.user = userModel(sequelize, Sequelize);
db.productmaster = ProductMasterModel(sequelize, Sequelize);
db.product = ProductModel(sequelize, Sequelize);
db.category = categoryModel(sequelize, Sequelize);
db.shop_config = shopConfigModel(sequelize, Sequelize); // เพิ่ม shop_config
db.customer = customerModel(sequelize, Sequelize); // เพิ่ม customer
db.customer_shops = customerShopModel(sequelize, Sequelize); // เพิ่ม customer_shops

// ความสัมพันธ์ที่มีอยู่


db.product.belongsTo(db.productmaster, { foreignKey: 'product_id', targetKey: 'product_id' });
db.product.belongsTo(db.shop, { foreignKey: 'shop_id', targetKey: 'id' });
db.productmaster.belongsTo(db.category, { foreignKey: 'category_id', targetKey: 'category_id' });

// ความสัมพันธ์ใหม่สำหรับ shop_config และ customer
db.shop_config.belongsTo(db.shop, { foreignKey: 'shop_id', as: 'shop' });
db.shop.hasOne(db.shop_config, { foreignKey: 'shop_id', as: 'config' });
db.customer_shops.belongsTo(db.customer, {
  foreignKey: 'customer_id',
  as: 'customer'
});

db.customer.hasMany(db.customer_shops, {
  foreignKey: 'customer_id',
  as: 'customer_shops'
});

db.customer_shops.belongsTo(db.shop, {
  foreignKey: 'shop_id',
  as: 'shop'
});

db.shop.hasMany(db.customer_shops, {
  foreignKey: 'shop_id',
  as: 'customer_shops'
});
db.testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

// เพิ่ม graceful shutdown handlers
const gracefulShutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Closing database connections...`);
  try {
    await sequelize.close();
    console.log('Database connections closed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error closing database connections:', error);
    process.exit(1);
  }
};

// Handle different termination signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));   // Ctrl+C
process.on('SIGTERM', () => gracefulShutdown('SIGTERM')); // Termination signal
process.on('SIGQUIT', () => gracefulShutdown('SIGQUIT')); // Quit signal

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
  console.error('Uncaught Exception:', error);
  await gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', async (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  await gracefulShutdown('unhandledRejection');
});

// Initialize database connection
db.testConnection().catch((error) => {
  console.error('Failed to initialize database connection:', error);
  process.exit(1);
});

export default db;