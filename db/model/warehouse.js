import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Warehouse = sequelize.define(
    'Warehouse',
    {
      warehouse_id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      shop_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
      },
      status: {
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
    },
    {
      tableName: 'warehouse',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      collate: 'utf8mb4_unicode_ci',
      paranoid: true,
    }
  );

  // Define associations
  Warehouse.associate = (models) => {
    Warehouse.belongsTo(models.Shop, { foreignKey: 'shop_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
    Warehouse.hasMany(models.Product, { foreignKey: 'warehouse_id', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
    Warehouse.hasMany(models.WarehouseProduct, { foreignKey: 'warehouse_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
  };

  return Warehouse;
};