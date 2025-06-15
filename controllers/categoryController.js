import db from '../db/index.js';
const { Category } = db;

const getcategoryList = async (req, res) => {
    try {
        const categoryList = await Category.findAll({
            where: {
                active: 'ACTIVE',
            },
        });
        return res.status(200).json({
            code: 1000,
            message: 'ดึงข้อมูลหมวดหมู่สำเร็จ',
            data: categoryList || [],
        });
    }
    catch (error) {
        console.error('ข้อผิดพลาดในการดึงข้อมูลหมวดหมู่:', error);
        return res.status(500).json({
            code: 500,
            message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
        });
    }
};

export { getcategoryList };