import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Employee = sequelize.define(
    'Employee',
    {
      employee_id: {
        type: DataTypes.CHAR(36), // เปลี่ยนจาก INTEGER เป็น CHAR(36)
        primaryKey: true,
      },
      shop_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
      },
      first_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      last_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(200),
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED'),
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
      tableName: 'employee', // เปลี่ยนจาก employees เป็น employee
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      deletedAt: 'deleted_at',
      collate: 'utf8mb4_unicode_ci',
      paranoid: true,
    }
  );

  // Define associations
  Employee.associate = (models) => {
    Employee.belongsTo(models.Shop, { foreignKey: 'shop_id', as: 'shop', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
    Employee.hasMany(models.EmployeeRole, { foreignKey: 'employee_id', as: 'roles', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
  };

  return Employee;
};