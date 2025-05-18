//model/shop.js
import { DataTypes } from 'sequelize';

export default (sequelize, Sequelize) => {
    const Category = sequelize.define('category', {
        category_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4, // Generates UUID automatically
            primaryKey: true,
        },

        cat_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        cat_prefix: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        active: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'ACTIVE',
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
        tableName: 'category',
        timestamps: false,
    });

    return Category;
};