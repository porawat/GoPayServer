// model/employee_roles.js
import { DataTypes } from 'sequelize';

export default (sequelize, Sequelize) => {
  const EmployeeRole = sequelize.define(
    'EmployeeRole',
    {
      employee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('CASHIER', 'INVENTORY', 'ADMIN'),
        allowNull: false,
      },
    },
    {
      tableName: 'employee_roles',
      timestamps: false,
    }
  );

  return EmployeeRole;
};