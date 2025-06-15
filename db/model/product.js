import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Product = sequelize.define(
    'Product',
    {
      product_uid: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
      },
      product_id: {
        type: DataTypes.CHAR(36),
        allowNull: true,
        unique: true,
      },
      product_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      shop_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      is_active: {
        type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
        allowNull: false,
        defaultValue: 'ACTIVE',
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      image_url: {
        type: DataTypes.STRING(255),
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
      warehouse_id: {
        type: DataTypes.CHAR(36),
        allowNull: true,
      },
    },
    {
      tableName: 'product',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      collate: 'utf8mb4_unicode_ci',
      paranoid: true,
    }
  );

  // Define associations
  Product.associate = (models) => {
    Product.belongsTo(models.Shop, { foreignKey: 'shop_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
    Product.belongsTo(models.Category, { foreignKey: 'category_id', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
    Product.belongsTo(models.Supplier, { foreignKey: 'supplier_id', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
    Product.belongsTo(models.Warehouse, { foreignKey: 'warehouse_id', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
    Product.hasMany(models.WarehouseProduct, { foreignKey: 'product_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
  };

  return Product;
};