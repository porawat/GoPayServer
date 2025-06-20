//backend/controllers/productController.js
import db from '../db/index.js';
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
const { Product, Warehouse, Category, Supplier } = db;

export const getmyproduct = async (req, res) => {
  const userId = req.user?.id;
  const { shopId } = req.params;

  if (!userId) {
    return res.status(401).json({
      code: 401,
      message: 'ต้องล็อกอินเพื่อดึงข้อมูลร้านค้า',
    });
  }

  if (!shopId) {
    return res.status(400).json({
      code: 400,
      message: 'ต้องระบุ shopId',
    });
  }

  try {
    const products = await Product.findAll({
      where: {
        shop_id: shopId,
        deleted_at: null,
      },
      include: [
        {
          model: Warehouse,
          as: 'warehouse',
          attributes: ['warehouse_id', 'name', 'location'],
        },
        {
          model: Category,
          as: 'category',
          attributes: ['category_id', 'cat_name'],
        },
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['supplier_id', 'name'],
        },
      ],
    });

    return res.status(200).json({
      code: 1000,
      message: 'ดึงข้อมูลสินค้าสำเร็จ',
      datarow: products || [],
    });
  } catch (error) {
    console.error('ข้อผิดพลาดในการดึงข้อมูลสินค้า:', error);
    return res.status(500).json({
      code: 5000,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
    });
  }
};

export const createProduct = async (req, res) => {
  const userId = req.user?.id;
  const { products } = req.body;

  if (!userId) {
    return res.status(401).json({
      code: 401,
      message: 'ต้องล็อกอินเพื่อเพิ่มสินค้า',
    });
  }

  if (!products || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({
      code: 400,
      message: 'ต้องระบุรายการสินค้าที่ต้องการเพิ่ม',
    });
  }

  try {
    const shopIds = [...new Set(products.map(p => p.shop_id))];
    if (shopIds.length !== 1) {
      return res.status(400).json({
        code: 400,
        message: 'สินค้าทั้งหมดต้องอยู่ในร้านเดียวกัน',
      });
    }

    const existingProducts = await Product.findAll({
      where: {
        shop_id: shopIds[0],
        product_id: {
          [Op.in]: products.map(p => p.product_id),
        },
        deleted_at: null,
      },
      attributes: ['product_id'],
    });

    const existingProductIds = existingProducts.map(p => p.product_id);
    const duplicateProducts = products.filter(p => existingProductIds.includes(p.product_id));

    if (duplicateProducts.length > 0) {
      return res.status(409).json({
        code: 4090,
        message: 'มีสินค้าบางรายการอยู่ในร้านแล้ว',
        data: { existingProductIds },
      });
    }

    const productsToCreate = products.map(product => ({
      product_uid: uuidv4(),
      product_id: product.product_id,
      shop_id: product.shop_id,
      price: product.price,
      stock: product.stock,
      product_name: product.product_name,
      description: product.description || null,
      image_url: product.image_url || null,
      is_active: product.is_active || 'ACTIVE',
      category_id: product.category_id || null,
      supplier_id: product.supplier_id || null,
      warehouse_id: product.warehouse_id || null,
      created_at: new Date(),
      updated_at: new Date(),
    }));

const createdProducts = await Product.bulkCreate(productsToCreate, {
        returning: true,
    });
    return res.status(201).json({
        code: 1000,
        message: 'เพิ่มสินค้าสำเร็จ',
        data: createdProducts,
    });
} catch (error) {
    console.error('BulkCreate error:', error.name, error.message, error.errors);
    return res.status(500).json({
        code: 5000,
        message: `เกิดข้อผิดพลาดในการเพิ่มสินค้า: ${error.message}`,
        errors: error.errors || [],
    });
  }
};

export const updateProduct = async (req, res) => {
  const userId = req.user?.id;
  const { productId } = req.body;

  if (!userId) {
    return res.status(401).json({
      code: 401,
      message: 'ต้องล็อกอินเพื่อแก้ไขสินค้า',
    });
  }

  if (!productId) {
    return res.status(400).json({
      code: 400,
      message: 'ต้องระบุ productId',
    });
  }

  try {
    const product = await Product.findOne({
      where: {
        product_id: productId,
        deleted_at: null,
      },
    });

    if (!product) {
      return res.status(404).json({
        code: 404,
        message: 'ไม่พบสินค้า',
      });
    }

    const updatedData = {
      price: req.body.price !== undefined ? req.body.price : product.price,
      stock: req.body.stock !== undefined ? req.body.stock : product.stock,
      is_active: req.body.is_active !== undefined ? req.body.is_active : product.is_active,
      description: req.body.description !== undefined ? req.body.description : product.description,
      image_url: req.body.image_url !== undefined ? req.body.image_url : product.image_url,
      category_id: req.body.category_id !== undefined ? req.body.category_id : product.category_id,
      supplier_id: req.body.supplier_id !== undefined ? req.body.supplier_id : product.supplier_id,
      warehouse_id: req.body.warehouse_id !== undefined ? req.body.warehouse_id : product.warehouse_id,
      updated_at: new Date(),
    };

    await product.update(updatedData);

    return res.status(200).json({
      code: 1000,
      message: 'แก้ไขสินค้าสำเร็จ',
      data: product,
    });
  } catch (error) {
    console.error('ข้อผิดพลาดในการแก้ไขสินค้า:', error);
    return res.status(500).json({
      code: 5000,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
    });
  }
};

export const deleteProduct = async (req, res) => {
  const userId = req.user?.id;
  const { productId } = req.body;

  if (!userId) {
    return res.status(401).json({
      code: 401,
      message: 'ต้องล็อกอินเพื่อลบสินค้า',
    });
  }

  if (!productId) {
    return res.status(400).json({
      code: 400,
      message: 'ต้องระบุ productId',
    });
  }

  try {
    const product = await Product.findOne({
      where: {
        product_id: productId,
        deleted_at: null,
      },
    });

    if (!product) {
      return res.status(404).json({
        code: 404,
        message: 'ไม่พบสินค้า',
      });
    }

    await product.update({
      deleted_at: new Date(),
      updated_at: new Date(),
    });

    return res.status(200).json({
      code: 1000,
      message: 'ลบสินค้าสำเร็จ',
    });
  } catch (error) {
    console.error('ข้อผิดพลาดในการลบสินค้า:', error);
    return res.status(500).json({
      code: 5000,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
    });
  }
};

export const productDetail = async (req, res) => {
  const userId = req.user?.id;
  const { productId } = req.body;

  if (!userId) {
    return res.status(401).json({
      code: 401,
      message: 'ต้องล็อกอินเพื่อดูรายละเอียดสินค้า',
    });
  }

  if (!productId) {
    return res.status(400).json({
      code: 400,
      message: 'ต้องระบุ productId',
    });
  }

  try {
    const product = await Product.findOne({
      where: {
        product_id: productId,
        deleted_at: null,
      },
      include: [
        {
          model: Warehouse,
          as: 'warehouse',
          attributes: ['warehouse_id', 'name', 'location'],
        },
        {
          model: Category,
          as: 'category',
          attributes: ['category_id', 'cat_name'],
        },
        {
          model: Supplier,
          as: 'supplier',
          attributes: ['supplier_id', 'name'],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({
        code: 404,
        message: 'ไม่พบสินค้า',
      });
    }

    return res.status(200).json({
      code: 1000,
      message: 'ดึงรายละเอียดสินค้าสำเร็จ',
      data: product,
    });
  } catch (error) {
    console.error('ข้อผิดพลาดในการดึงรายละเอียดสินค้า:', error);
    return res.status(500).json({
      code: 5000,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
    });
  }
};