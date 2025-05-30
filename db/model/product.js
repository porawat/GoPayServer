import { DataTypes } from 'sequelize';

export default (sequelize, Sequelize) => {
    const Product = sequelize.define('product', {
        product_uid: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4, // Generates UUID automatically
            primaryKey: true,
        },
        product_id: {
            type: DataTypes.UUID,
            allowNull: false,

        },
        product_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            collate: 'utf8mb4_unicode_ci',
        },
        shop_id: {
            type: DataTypes.CHAR(36), // ต้องตรงกับ shop.id
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            collate: 'utf8mb4_unicode_ci',
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        is_active: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'ACTIVE',
        },
        stock: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        image_url: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        deleted_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    }, {
        // Model options
        tableName: 'product',
        timestamps: false, // No automatic timestamps for simplicity
        indexes: [
            {
                fields: ['product_uid'], // Index on product_uid
            },
            {
                fields: ['product_id'], // Index on product_id (foreign key)
            },
            {
                fields: ['shop_id'], // Index on shop_id (foreign key)
            },
        ],
    });
    return Product;
};