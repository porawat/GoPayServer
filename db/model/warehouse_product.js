import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const WarehouseProduct = sequelize.define(
    'WarehouseProduct',
    {
      warehouse_product_id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
      },
      warehouse_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
      },
      product_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
      },
      shop_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
      },
      stock_quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
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
    },
    {
      tableName: 'warehouse_product',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      collate: 'utf8mb4_unicode_ci',
    }
  );

  // Define associations
  WarehouseProduct.associate = (models) => {
    WarehouseProduct.belongsTo(models.Warehouse, { foreignKey: 'warehouse_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
    WarehouseProduct.belongsTo(models.Product, { foreignKey: 'product_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
    WarehouseProduct.belongsTo(models.Shop, { foreignKey: 'shop_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
  };

  return WarehouseProduct;
};