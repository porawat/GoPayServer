//db/index.js
import { Sequelize } from 'sequelize';
import { config } from 'dotenv';
import shopModel from './model/shop.js';
import employeeModel from './model/employee.js';
import employeeRoleModel from './model/employee_roles.js';
import userModel from './model/user.js';
import productMasterModel from './model/product_master.js';
import productModel from './model/product.js';
import categoryModel from './model/category.js';
import shopConfigModel from './model/shop_config.js';
import customerModel from './model/customer.js';
import customerShopsModel from './model/customer_shops.js';
import supplierModel from './model/supplier.js';
import warehouseModel from './model/warehouse.js';
import warehouseProductModel from './model/warehouse_product.js';

config();

const requiredEnvVars = ['DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_PORT'];
const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error(`Missing environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

console.log('DB_NAME:', process.env.DB_NAME);

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    timezone: '+07:00',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
      evict: 5000,
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false, // เปลี่ยนจาก true เป็น console.log
    retry: {
      match: [
        /ConnectionError/,
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/,
      ],
      max: 3,
    },
  }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// กำหนดโมเดล
db.Shop = shopModel(sequelize, Sequelize);
db.Employee = employeeModel(sequelize, Sequelize);
db.EmployeeRole = employeeRoleModel(sequelize, Sequelize);
db.User = userModel(sequelize, Sequelize);
db.ProductMaster = productMasterModel(sequelize, Sequelize);
db.Product = productModel(sequelize, Sequelize);
db.Category = categoryModel(sequelize, Sequelize);
db.ShopConfig = shopConfigModel(sequelize, Sequelize);
db.Customer = customerModel(sequelize, Sequelize);
db.CustomerShops = customerShopsModel(sequelize, Sequelize);
db.Supplier = supplierModel(sequelize, Sequelize);
db.Warehouse = warehouseModel(sequelize, Sequelize);
db.WarehouseProduct = warehouseProductModel(sequelize, Sequelize);

// กำหนดความสัมพันธ์

// User และ Shop
db.User.hasMany(db.Shop, { foreignKey: 'owner_id', as: 'shops', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
db.Shop.belongsTo(db.User, { foreignKey: 'owner_id', as: 'owner', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });

// Shop และ ShopConfig
db.Shop.hasOne(db.ShopConfig, { foreignKey: 'shop_id', as: 'config', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
db.ShopConfig.belongsTo(db.Shop, { foreignKey: 'shop_id', as: 'shop', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });

// Shop และ Employee
db.Shop.hasMany(db.Employee, { foreignKey: 'shop_id', as: 'employees', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
db.Employee.belongsTo(db.Shop, { foreignKey: 'shop_id', as: 'shop', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });

// Employee และ EmployeeRole
db.Employee.hasMany(db.EmployeeRole, { foreignKey: 'employee_id', as: 'roles', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
db.EmployeeRole.belongsTo(db.Employee, { foreignKey: 'employee_id', as: 'employee', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });

// Customer และ CustomerShops
db.Customer.hasMany(db.CustomerShops, { foreignKey: 'customer_id', as: 'customer_shops', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
db.CustomerShops.belongsTo(db.Customer, { foreignKey: 'customer_id', as: 'customer', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });

// Shop และ CustomerShops
db.Shop.hasMany(db.CustomerShops, { foreignKey: 'shop_id', as: 'customer_shops', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
db.CustomerShops.belongsTo(db.Shop, { foreignKey: 'shop_id', as: 'shop', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });

// Customer และ Shop (many-to-many ผ่าน CustomerShops)
db.Customer.belongsToMany(db.Shop, {
  through: db.CustomerShops,
  foreignKey: 'customer_id',
  otherKey: 'shop_id',
  as: 'shops',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});
db.Shop.belongsToMany(db.Customer, {
  through: db.CustomerShops,
  foreignKey: 'shop_id',
  otherKey: 'customer_id',
  as: 'customers',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE',
});

// ProductMaster และ Category, Supplier
db.ProductMaster.belongsTo(db.Category, { foreignKey: 'category_id', as: 'category', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
db.ProductMaster.belongsTo(db.Supplier, { foreignKey: 'supplier_id', as: 'supplier', onDelete: 'SET NULL', onUpdate: 'CASCADE' });

// Product และ Shop, Category, Supplier, Warehouse
db.Product.belongsTo(db.Shop, { foreignKey: 'shop_id', as: 'shop', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
db.Product.belongsTo(db.Category, { foreignKey: 'category_id', as: 'category', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
db.Product.belongsTo(db.Supplier, { foreignKey: 'supplier_id', as: 'supplier', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
db.Product.belongsTo(db.Warehouse, { foreignKey: 'warehouse_id', as: 'warehouse', onDelete: 'SET NULL', onUpdate: 'CASCADE' });

// Warehouse และ Shop, Product
db.Warehouse.belongsTo(db.Shop, { foreignKey: 'shop_id', as: 'shop', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
db.Warehouse.hasMany(db.Product, { foreignKey: 'warehouse_id', as: 'products', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
db.Warehouse.hasMany(db.WarehouseProduct, { foreignKey: 'warehouse_id', as: 'warehouse_products', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });

// WarehouseProduct และ Warehouse, Product, Shop
db.WarehouseProduct.belongsTo(db.Warehouse, { foreignKey: 'warehouse_id', as: 'warehouse', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
db.WarehouseProduct.belongsTo(db.Product, { foreignKey: 'product_id', as: 'product', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
db.WarehouseProduct.belongsTo(db.Shop, { foreignKey: 'shop_id', as: 'shop', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });

// Product และ WarehouseProduct
db.Product.hasMany(db.WarehouseProduct, { foreignKey: 'product_id', as: 'warehouse_products', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });

// Supplier และ Product, ProductMaster
db.Supplier.hasMany(db.Product, { foreignKey: 'supplier_id', as: 'products', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
db.Supplier.hasMany(db.ProductMaster, { foreignKey: 'supplier_id', as: 'productMasters', onDelete: 'SET NULL', onUpdate: 'CASCADE' });

// Category และ Product
db.Category.hasMany(db.Product, { foreignKey: 'category_id', as: 'products', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
db.Category.hasMany(db.ProductMaster, { foreignKey: 'category_id', as: 'productMasters', onDelete: 'SET NULL', onUpdate: 'CASCADE' });

// Product และ ProductMaster
db.ProductMaster.hasMany(db.Product, { foreignKey: 'product_id', targetKey: 'product_id', as: 'products', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
db.Product.belongsTo(db.ProductMaster, { foreignKey: 'product_id', targetKey: 'product_id', as: 'productMasters', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });

db.testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

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

// Handle termination signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGQUIT', () => gracefulShutdown('SIGQUIT'));

// Handle uncaught exceptions and rejections
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