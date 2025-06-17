import db from '../db/index.js';
const { ProductMaster, Category } = db;

const createProductMaster = async (req, res) => {
  const {
    sku,
    name,
    description,
    category_id,
    supplier_id,
    cost_price,
    selling_price,
    reorder_level,
    image_url,
  } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ code: 401, message: 'ต้องล็อกอินเพื่อเพิ่มสินค้า' });
  }

  try {
    // ตรวจสอบว่ามี category_id ที่ถูกต้องหรือไม่
    if (category_id) {
      const category = await Category.findByPk(category_id);
      if (!category || category.status !== 'ACTIVE') {
        return res.status(400).json({
          code: 400,
          message: 'หมวดหมู่ไม่ถูกต้องหรือไม่ได้ใช้งาน',
        });
      }
    }

    const newProductMaster = await ProductMaster.create({
      sku,
      name,
      description,
      category_id,
      supplier_id,
      cost_price,
      selling_price,
      reorder_level,
      image_url,
      status: 'ACTIVE', // เพิ่ม status ค่าเริ่มต้น
    });

    return res.status(201).json({
      code: 1000,
      message: 'เพิ่มสินค้าสำเร็จ',
      data: newProductMaster,
    });
  } catch (error) {
    console.error('ข้อผิดพลาดในการเพิ่มสินค้า:', error);
    return res.status(500).json({
      code: 500,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
    });
  }
};

const getProductMasterList = async (req, res) => {
  console.log('getProductMasterList');
  try {
    const productList = await ProductMaster.findAll({
      where: {
        status: 'ACTIVE',
      },
      include: [{ model: Category, as: 'category' }], // เพิ่ม relation กับ Category
    });
    return res.status(200).json({
      code: 1000,
      message: 'ดึงข้อมูลสินค้าสำเร็จ',
      data: productList || [],
    });
  } catch (error) {
    console.error('ข้อผิดพลาดในการดึงข้อมูลสินค้า:', error);
    return res.status(500).json({
      code: 5000,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
    });
  }
};

const getProductMasterById = async (req, res) => {
  const { category_id } = req.params;

  const whereClause = {
    status: 'ACTIVE',
  };

  if (category_id !== 'all') {
    whereClause.category_id = category_id;
  }

  try {
    const productList = await ProductMaster.findAll({
      where: whereClause,
      include: [{ model: Category, as: 'category' }],
    });
    return res.status(200).json({
      code: 1000,
      message: 'ดึงข้อมูลสินค้าสำเร็จ',
      data: productList || [],
    });
  } catch (error) {
    console.error('ข้อผิดพลาดในการดึงข้อมูลสินค้า:', error);
    return res.status(500).json({
      code: 5000,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
    });
  }
};

// API สำหรับหมวดหมู่สินค้า
const createCategory = async (req, res) => {
  const { cat_name } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ code: 401, message: 'ต้องล็อกอินเพื่อเพิ่มหมวดหมู่' });
  }

  if (!cat_name) {
    return res.status(400).json({ code: 400, message: 'ต้องระบุชื่อหมวดหมู่' });
  }

  try {
    const existingCategory = await Category.findOne({ where: { cat_name } });
    if (existingCategory) {
      return res.status(400).json({
        code: 400,
        message: 'ชื่อหมวดหมู่นี้มีอยู่แล้ว',
      });
    }

    const newCategory = await Category.create({
      cat_name,
      status: 'ACTIVE',
    });

    return res.status(201).json({
      code: 1000,
      message: 'เพิ่มหมวดหมู่สำเร็จ',
      data: newCategory,
    });
  } catch (error) {
    console.error('ข้อผิดพลาดในการเพิ่มหมวดหมู่:', error);
    return res.status(500).json({
      code: 500,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
    });
  }
};

const getCategoryList = async (req, res) => {
  console.log('getCategoryList');
  try {
    const categoryList = await Category.findAll({
      where: {
        status: 'ACTIVE',
      },
    });
    return res.status(200).json({
      code: 1000,
      message: 'ดึงข้อมูลหมวดหมู่สำเร็จ',
      data: categoryList || [],
    });
  } catch (error) {
    console.error('ข้อผิดพลาดในการดึงข้อมูลหมวดหมู่:', error);
    return res.status(500).json({
      code: 5000,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
    });
  }
};

const getCategoryById = async (req, res) => {
  const { category_id } = req.params;

  try {
    const category = await Category.findOne({
      where: {
        category_id,
        status: 'ACTIVE',
      },
      include: [{ model: ProductMaster, as: 'products' }],
    });

    if (!category) {
      return res.status(404).json({
        code: 404,
        message: 'ไม่พบหมวดหมู่',
      });
    }

    return res.status(200).json({
      code: 1000,
      message: 'ดึงข้อมูลหมวดหมู่สำเร็จ',
      data: category,
    });
  } catch (error) {
    console.error('ข้อผิดพลาดในการดึงข้อมูลหมวดหมู่:', error);
    return res.status(500).json({
      code: 5000,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
    });
  }
};

export {
  createProductMaster,
  getProductMasterList,
  getProductMasterById,
  createCategory,
  getCategoryList,
  getCategoryById,
};