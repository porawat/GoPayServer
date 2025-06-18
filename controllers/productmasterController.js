import db from '../db/index.js';
import { v4 as uuidv4 } from 'uuid';
const { ProductMaster, Category, Product, Shop, Supplier, Warehouse } = db;

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
      status: 'ACTIVE',
    });

    return res.status(201).json({
      code: 1000,
      message: 'เพิ่มสินค้าสำเร็จ',
      data: newProductMaster,
    });
  } catch (error) {
    console.error('ข้อผิดพลาดในการเพิ่มสินค้า:', error.message, error.stack);
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
      include: [{ model: Category, as: 'category' }],
    });
    return res.status(200).json({
      code: 1000,
      message: 'ดึงข้อมูลสินค้าสำเร็จ',
      data: productList || [],
    });
  } catch (error) {
    console.error('ข้อผิดพลาดในการดึงข้อมูลสินค้า:', error.message, error.stack);
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
    console.error('ข้อผิดพลาดในการดึงข้อมูลสินค้า:', error.message, error.stack);
    return res.status(500).json({
      code: 5000,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
    });
  }
};

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
    console.error('ข้อผิดพลาดในการเพิ่มหมวดหมู่:', error.message, error.stack);
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
    console.error('ข้อผิดพลาดในการดึงข้อมูลหมวดหมู่:', error.message, error.stack);
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
    console.error('ข้อผิดพลาดในการดึงข้อมูลหมวดหมู่:', error.message, error.stack);
    return res.status(500).json({
      code: 5000,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
    });
  }
};

const createProduct = async (req, res) => {
  const { products } = req.body;
  const userId = req.user?.id;

  console.log('Received products:', products); // เพิ่ม logging เพื่อ debug

  if (!userId) {
    return res.status(401).json({ code: 401, message: 'ต้องล็อกอินเพื่อเพิ่มสินค้า' });
  }

  if (!products || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ code: 400, message: 'ต้องระบุข้อมูลสินค้า' });
  }

  try {
    // ตรวจสอบข้อมูลที่จำเป็นและความถูกต้องของ foreign keys
    for (const product of products) {
      const { product_id, shop_id, price, stock, product_name, description, image_url, is_active, category_id, supplier_id, warehouse_id } = product;

      console.log('Processing product:', { product_id, shop_id, price, stock, product_name }); // logging

      // ตรวจสอบข้อมูลที่จำเป็น
      if (!product_id || !shop_id || price == null || stock == null || !product_name) {
        return res.status(400).json({
          code: 400,
          message: `ข้อมูลสินค้าไม่ครบถ้วนสำหรับ product_id: ${product_id} (ต้องระบุ product_id, shop_id, price, stock, product_name)`,
        });
      }

      // ตรวจสอบว่า product_id มีอยู่ใน product_master
      const productMaster = await ProductMaster.findByPk(product_id);
      if (!productMaster || productMaster.status !== 'ACTIVE') {
        return res.status(400).json({
          code: 400,
          message: `ไม่พบสินค้าหรือสินค้าไม่ใช้งานสำหรับ product_id: ${product_id}`,
        });
      }

      // ตรวจสอบ shop_id
      const shop = await Shop.findByPk(shop_id);
      if (!shop) {
        return res.status(400).json({
          code: 400,
          message: `ไม่พบร้านค้าสำหรับ shop_id: ${shop_id}`,
        });
      }

      // ตรวจสอบ category_id (ถ้ามี)
      if (category_id) {
        const category = await Category.findByPk(category_id);
        if (!category || category.status !== 'ACTIVE') {
          return res.status(400).json({
            code: 400,
            message: `หมวดหมู่ไม่ถูกต้องหรือไม่ได้ใช้งานสำหรับ category_id: ${category_id}`,
          });
        }
      }

      // ตรวจสอบ supplier_id (ถ้ามี)
      if (supplier_id) {
        const supplier = await Supplier.findByPk(supplier_id);
        if (!supplier || supplier.status !== 'ACTIVE') {
          return res.status(400).json({
            code: 400,
            message: `ผู้จัดจำหน่ายไม่ถูกต้องหรือไม่ได้ใช้งานสำหรับ supplier_id: ${supplier_id}`,
          });
        }
      }

      // ตรวจสอบ warehouse_id (ถ้ามี)
      if (warehouse_id) {
        const warehouse = await Warehouse.findByPk(warehouse_id);
        if (!warehouse) {
          return res.status(400).json({
            code: 400,
            message: `คลังสินค้าไม่ถูกต้องสำหรับ warehouse_id: ${warehouse_id}`,
          });
        }
      }
    }

    // เพิ่มสินค้าลงในตาราง product
    const newProducts = await Promise.all(
      products.map(async (product) => {
        console.log('Creating product:', product); // logging
        return await Product.create({
          product_uid: uuidv4(),
          product_id: product.product_id,
          shop_id: product.shop_id,
          product_name: product.product_name,
          description: product.description || null,
          price: parseFloat(product.price),
          stock: parseInt(product.stock),
          image_url: product.image_url || null,
          is_active: product.is_active || 'ACTIVE',
          category_id: product.category_id || null,
          supplier_id: product.supplier_id || null,
          warehouse_id: product.warehouse_id || null,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
        });
      })
    );

    console.log('Products created:', newProducts); // logging
    return res.status(201).json({
      code: 1000,
      message: 'เพิ่มสินค้าสำเร็จ',
      data: newProducts,
    });
  } catch (error) {
    console.error('ข้อผิดพลาดในการเพิ่มสินค้า:', error.message, error.stack);
    return res.status(500).json({
      code: 500,
      message: `เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: ${error.message}`,
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
  createProduct,
};