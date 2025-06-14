import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Category = sequelize.define(
    'Category',
    {
      category_id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
      },
      cat_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      active: {
        type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
        defaultValue: 'ACTIVE',
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deleted_at: {
        type: DataTypes.DATE,
        defaultValue: null,
      },
      cat_prefix: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: 'category',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      collate: 'utf8mb4_unicode_ci',
    }
  );

  return Category;
};