import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Supplier = sequelize.define(
    'Supplier',
    {
      supplier_id: {
        type: DataTypes.CHAR(36),
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(100),
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
      contact_info: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: 'supplier',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      collate: 'utf8mb4_unicode_ci',
      paranoid: true,
    }
  );

  // Define associations
  Supplier.associate = (models) => {
    Supplier.hasMany(models.Product, { foreignKey: 'supplier_id', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
    Supplier.hasMany(models.ProductMaster, { foreignKey: 'supplier_id', onDelete: 'SET NULL', onUpdate: 'CASCADE' });
  };

  return Supplier;
};