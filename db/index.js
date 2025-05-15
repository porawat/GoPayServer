// db/index.js
import { Sequelize } from 'sequelize';
import shopModel from './model/shop.js';
import employeeModel from './model/employee.js';
import employeeRoleModel from './model/employee_roles.js';
import userModel from './model/user.js';
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

db.shop = shopModel(sequelize, Sequelize);
db.employee = employeeModel(sequelize, Sequelize);
db.employeeRole = employeeRoleModel(sequelize, Sequelize);
db.user = userModel(sequelize, Sequelize);

db.employee.hasMany(db.employeeRole, { as: 'roles', foreignKey: 'employee_id' });
db.employeeRole.belongsTo(db.employee, { foreignKey: 'employee_id' });
db.employee.belongsTo(db.shop, { foreignKey: 'shop_id' });

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