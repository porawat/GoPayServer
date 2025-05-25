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
          model: 'shops', // ตรวจสอบให้แน่ใจว่าตรงกับชื่อตารางจริง
          key: 'id' 
        },
      },
      first_name: {
        type: DataTypes.STRING(100), // จำกัดความยาว
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 100]
        }
      },
      last_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 100]
        }
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
          notEmpty: true
        }
      },
      password: {
        type: DataTypes.STRING(255), // เพิ่มความยาวสำหรับ hashed password
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [6, 255] // รหัสผ่านขั้นต่ำ 6 ตัวอักษร
        }
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        validate: {
          is: /^[0-9+\-\s()]*$/ // อนุญาตเฉพาะตัวเลขและสัญลักษณ์โทรศัพท์
        }
      },
      status: {
        type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED'),
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
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'employees',
      timestamps: true, // เปิด timestamps เพื่อ auto-update
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          unique: true,
          fields: ['email']
        },
        {
          fields: ['shop_id']
        },
        {
          fields: ['status']
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
  Employee.prototype.getFullName = function() {
    return `${this.first_name} ${this.last_name}`;
  };

  Employee.prototype.isActive = function() {
    return this.status === 'ACTIVE';
  };

  return Employee;
};