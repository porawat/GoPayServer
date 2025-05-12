import { Sequelize } from 'sequelize';
import shopModel from './model/shop.js';
import { config } from 'dotenv';
config();
console.log(process.env.DB_NAME)
// Configure Sequelize to connect to the database
const sequelize = new Sequelize(
    process.env.DB_NAME, // Database name
    process.env.DB_USER, // Database user
    process.env.DB_PASSWORD, // Database password
    {
        host: process.env.DB_HOST, // Database host
        port: process.env.DB_PORT, // Database port
        dialect: 'mysql', // Supported dialects: 'mysql' | 'mariadb' | 'postgres' | 'mssql'
        define: {
            timestamps: false // Additional configuration
        },
        logging: process.env.NODE_ENV === 'development' ? console.log : false // Enable SQL logging in development
    }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Initialize models
db.shop = shopModel(sequelize, Sequelize);

// Test connection on startup
db.testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection established.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        throw error;
    }
};

export default db;