import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Employee = sequelize.define(
    'Employee',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      shop_id: {
        type: DataTypes.CHAR(36),
        allowNull: false,
        references: {
          model: 'shop', // ตรวจสอบให้แน่ใจว่าตรงกับชื่อตารางจริง
          key: 'id'
        },
      },
      first_name: {
        type: DataTypes.STRING(100), // จำกัดความยาว
        allowNull: false,

      },
      last_name: {
        type: DataTypes.STRING(100),
        allowNull: false,

      },
      email: {
        type: DataTypes.STRING(200),
        allowNull: false,
        unique: 'unique_email_idx', // กำหนดชื่อ index

      },
      password: {
        type: DataTypes.STRING(255), // เพิ่มความยาวสำหรับ hashed password
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
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },

      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'employees',
      timestamps: true, // เปิด timestamps เพื่อ auto-update
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [

        {
          name: 'shop_status_idx', // รวม index ของ shop_id และ status
          fields: ['shop_id', 'status']
        }
      ],
      // เพิ่ม hooks สำหรับ password hashing
      hooks: {
        beforeCreate: async (employee) => {
          if (employee.password) {
            // ใส่ logic hash password ที่นี่
            // const bcrypt = require('bcrypt');
            // employee.password = await bcrypt.hash(employee.password, 10);
          }
        },
        beforeUpdate: async (employee) => {
          if (employee.changed('password')) {
            // ใส่ logic hash password ที่นี่
            // const bcrypt = require('bcrypt');
            // employee.password = await bcrypt.hash(employee.password, 10);
          }
        }
      }
    }
  );

  // เพิ่ม instance methods
  Employee.prototype.getFullName = function () {
    return `${this.first_name} ${this.last_name}`;
  };

  Employee.prototype.isActive = function () {
    return this.status === 'ACTIVE';
  };

  return Employee;
};