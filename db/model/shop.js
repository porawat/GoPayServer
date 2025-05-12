export default (sequelize, Sequelize) => {
    const shopModel = sequelize.define(
        'shop',
        {
            id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4, field: 'id' },
            slug_id: { type: Sequelize.STRING(50), allowNull: false, field: 'slug_id' },
            owner_id: { type: Sequelize.STRING(100), allowNull: false, field: 'owner_id' },
            shop_name: { type: Sequelize.STRING(150), allowNull: false, field: 'shop_name' },
            shop_tel: { type: Sequelize.STRING(50), allowNull: true, field: 'shop_tel' },
            contact_name: { type: Sequelize.STRING(150), allowNull: true, field: 'contact_name' },
            email: { type: Sequelize.STRING(150), allowNull: true, field: 'email' },
            avatar: { type: Sequelize.STRING(250), allowNull: true, field: 'avatar' },
            cover: { type: Sequelize.STRING(250), allowNull: true, field: 'cover' },
            is_active: { type: Sequelize.STRING(150), allowNull: false, field: 'is_active' },
            created_at: { type: Sequelize.DATE, allowNull: false, field: 'created_at', defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, field: 'updated_at' },
            deleted_at: { type: Sequelize.DATE, allowNull: true, field: 'deleted_at' },
        },
        {
            tableName: 'shop'
        }
    );

    return shopModel;
}