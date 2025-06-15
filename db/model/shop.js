import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Shop = sequelize.define(
    'Shop',
    {
      id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
      },
      slug_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      owner_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
      },
      shop_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      shop_tel: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      contact_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      avatar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      cover: {
        type: DataTypes.STRING,
        allowNull: true,
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
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deleted_at: {
        type: DataTypes.DATE,
        defaultValue: null,
      },
    },
    {
      tableName: 'shop',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      collate: 'utf8mb4_unicode_ci',
      paranoid: true,
    }
  );

  // Define associations
  Shop.associate = (models) => {
    Shop.belongsTo(models.User, { foreignKey: 'owner_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
    Shop.hasOne(models.ShopConfig, { foreignKey: 'shop_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
    Shop.hasMany(models.Employee, { foreignKey: 'shop_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
    Shop.belongsToMany(models.Customer, {
      through: models.CustomerShop,
      foreignKey: 'shop_id',
      otherKey: 'customer_id',
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
  };

  return Shop;
};