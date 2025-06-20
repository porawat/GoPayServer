import db from '../db/index.js';
const { Category } = db;

const getCategories = async (req, res) => {
  try {
    const categoryList = await Category.findAll({
      where: {
        active: 'ACTIVE',
        deleted_at: null,
      },
      attributes: ['category_id', 'cat_name','cat_prefix'],
    });
    return res.status(200).json({
      code: 1000,
      datarow: categoryList || [],
    });
  } catch (error) {
    console.error('ข้อผิดพลาดในการดึงข้อมูลหมวดหมู่:', error);
    return res.status(500).json({
      code: 5000,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
    });
  }
};

export { getCategories };