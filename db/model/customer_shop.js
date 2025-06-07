import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const CustomerShop = sequelize.define('customer_shops', {
        customer_id: {
            type: DataTypes.CHAR(36),
            allowNull: false,
            references: {
                model: 'customer',
                key: 'id'
            }
        },
        shop_id: {
            type: DataTypes.CHAR(36),
            allowNull: false,
            references: {
                model: 'shop',
                key: 'id'
            }
        },
        status: {
            type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
            allowNull: false,
            defaultValue: 'PENDING',
        },
        is_active: {
            type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
            allowNull: false,
            defaultValue: 'ACTIVE',
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
        ,
        deleted_at: {
            type: DataTypes.DATE,
            allowNull: true,
        }
    }, {
        tableName: 'customer_shops',
        timestamps: false
    });

    return CustomerShop;
};