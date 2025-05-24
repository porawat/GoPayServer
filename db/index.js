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
    define: {
      timestamps: false,
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
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

// ความสัมพันธ์ที่มีอยู่
db.employee.hasMany(db.employeeRole, { as: 'roles', foreignKey: 'employee_id' });
db.employeeRole.belongsTo(db.employee, { foreignKey: 'employee_id' });
db.employee.belongsTo(db.shop, { foreignKey: 'shop_id' });

db.product.belongsTo(db.productmaster, { foreignKey: 'product_id', targetKey: 'product_id' });
db.product.belongsTo(db.shop, { foreignKey: 'shop_id', targetKey: 'id' });
db.productmaster.belongsTo(db.category, { foreignKey: 'category_id', targetKey: 'category_id' });

// ความสัมพันธ์ใหม่สำหรับ shop_config และ customer
db.shop_config.belongsTo(db.shop, { foreignKey: 'shop_id', as: 'shop' });
db.shop.hasOne(db.shop_config, { foreignKey: 'shop_id', as: 'config' });

db.customer.belongsTo(db.shop, { foreignKey: 'shop_id', as: 'shop' });
db.shop.hasMany(db.customer, { foreignKey: 'shop_id', as: 'customers' });

db.testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

db.testConnection().catch((error) => {
  console.error('Failed to initialize database connection:', error);
  process.exit(1);
});

export default db;