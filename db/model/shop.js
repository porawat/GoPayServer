import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Shop = sequelize.define('shop', {
    id: {
      type: DataTypes.CHAR(36),
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    slug_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    owner_id: {
      type: DataTypes.CHAR(36), // เปลี่ยนเป็น CHAR(36) เพื่อให้ตรงกับ UUID
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
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'ACTIVE',
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
    tableName: 'shop',
    timestamps: false,
  });

  return Shop;
};