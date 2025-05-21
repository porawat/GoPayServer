import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const ShopConfig = sequelize.define('shop_config', {
    id: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      allowNull: false,
    },
    shop_id: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: { model: 'shop', key: 'id' },
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    latitude: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.STRING(100),
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
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 1,
    },
    notification_sms: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 0,
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
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
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
    tableName: 'shop_config',
    timestamps: false,
  });

  return ShopConfig;
};
