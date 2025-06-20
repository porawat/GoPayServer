import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const ProductMaster = sequelize.define(
    'ProductMaster',
    {
      product_id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
      },
      sku: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      category_id: {
        type: DataTypes.CHAR(36),
        allowNull: true,
      },
      supplier_id: {
        type: DataTypes.CHAR(36),
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
      },
      status: {
        type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
        allowNull: true,
        defaultValue: 'ACTIVE',
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'product_master',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      collate: 'utf8mb4_unicode_ci',
      paranoid: true,
    }
  );

  // Define associations
  ProductMaster.associate = (models) => {
    ProductMaster.belongsTo(models.Category, { foreignKey: 'category_id', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
  //  ProductMaster.belongsTo(models.Supplier, { foreignKey: 'supplier_id', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
  };

  return ProductMaster;
};