import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const CustomerShops = sequelize.define(
    'CustomerShops',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      customer_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
      },
      shop_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
        allowNull: false,
        defaultValue: 'PENDING',
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
      is_active: {
        type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
        allowNull: false,
        defaultValue: 'ACTIVE',
      },
    },
    {
      tableName: 'customer_shops',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      paranoid: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    }
  );

  CustomerShops.associate = (models) => {
    CustomerShops.belongsTo(models.Customer, { foreignKey: 'customer_id', as: 'customer' });
    CustomerShops.belongsTo(models.Shop, { foreignKey: 'shop_id', as: 'shop' });
  };

  return CustomerShops;
};