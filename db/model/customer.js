// db/model/customer.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Customer = sequelize.define(
    'Customer',
    {
      id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
      },
      phone: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
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
      tableName: 'customer',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      paranoid: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    }
  );

  Customer.associate = (models) => {
    Customer.hasMany(models.CustomerShops, {
      foreignKey: 'customer_id',
      as: 'customer_shops',
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
    Customer.belongsToMany(models.Shop, {
      through: models.CustomerShops,
      foreignKey: 'customer_id',
      otherKey: 'shop_id',
      as: 'shops',
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
  };

  return Customer;
};