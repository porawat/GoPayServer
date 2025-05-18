import { DataTypes } from 'sequelize';

export default (sequelize, Sequelize) => {
    const ProductMaster = sequelize.define('product_master', {
        product_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4, // Generates UUID automatically
            primaryKey: true,
        },
        sku: {
            type: DataTypes.STRING(100),
            allowNull: false,
            collate: 'utf8mb4_unicode_ci',
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            collate: 'utf8mb4_unicode_ci',
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            collate: 'utf8mb4_unicode_ci',
        },
        category_id: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        supplier_id: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        cost_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        selling_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        reorder_level: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 10,
        },
        image_url: {
            type: DataTypes.STRING(255),
            allowNull: true,
            collate: 'utf8mb4_unicode_ci',
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'ACTIVE',
        },
        created_at: {
            type: DataTypes.DATE(3), // Datetime with millisecond precision
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3)'),
        },
        updated_at: {
            type: DataTypes.DATE(3), // Datetime with millisecond precision
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP(3)'),
            onUpdate: Sequelize.literal('CURRENT_TIMESTAMP(3)'), // Update timestamp on record update
        },
        deleted_at: {
            type: DataTypes.DATE(3), // Datetime with millisecond precision
            allowNull: true,
            defaultValue: null,
            onDelete: 'SET NULL', // Set to null on delete
        },
    }, {
        // Model options
        tableName: 'product_master',
        timestamps: false, // Disable Sequelize's automatic timestamps (we're handling created_at/updated_at manually)
        indexes: [
            {
                fields: ['product_id'], // Index on product_id
            },
            {
                fields: ['category_id'], // Index on category_id
            },
            {
                fields: ['supplier_id'], // Index on supplier_id
            },
        ],
    })
    return ProductMaster;
};