import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const ShopConfig = sequelize.define(
    'ShopConfig',
    {
      id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
      },
      shop_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      latitude: {
        type: DataTypes.DECIMAL(9, 6),
        allowNull: true,
      },
      longitude: {
        type: DataTypes.DECIMAL(9, 6),
        allowNull: true,
      },
      open_time: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      close_time: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      is_active: {
        type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
        allowNull: false,
        defaultValue: 'ACTIVE',
      },
      notification_email: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      notification_sms: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      language: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 'TH',
      },
      currency: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 'THB',
      },
      theme: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'light',
      },
      qr_code: {
        type: DataTypes.STRING,
        allowNull: true,
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
      tableName: 'shop_config',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      collate: 'utf8mb4_unicode_ci',
    }
  );

  // Define associations
  ShopConfig.associate = (models) => {
    ShopConfig.belongsTo(models.Shop, { foreignKey: 'shop_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
  };

  return ShopConfig;
};