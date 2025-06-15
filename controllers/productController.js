import db from '../db/index.js';
import uploadImage from '../provider/upload.js';
const { Product, Warehouse, Category, Supplier } = db;

const getmyproduct = async (req, res) => {
  const userId = req.user?.id;
  const { shopId } = req.params;
  if (!userId) {
    return res.status(401).json({ code: 401, message: 'ต้องล็อกอินเพื่อดึงข้อมูลร้านค้า' });
  }
  try {
    const products = await Product.findAll({
      where: { shop_id: shopId, deleted_at: null },
      include: [
        { model: Warehouse, as: 'warehouse', attributes: ['warehouse_id', 'name', 'location'] },
        { model: Category, as: 'category', attributes: ['category_id', 'cat_name'] },
        { model: Supplier, as: 'supplier', attributes: ['supplier_id', 'name'] },
      ],
    });
    return res.status(200).json({
      code: 1000,
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

const createProduct = async (req, res) => {
  const { products } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      code: 401,
      message: 'ต้องล็อกอินเพื่อเพิ่มสินค้า',
    });
  }

  try {
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        code: 4000,
        message: 'กรุณาส่งข้อมูลสินค้าในรูปแบบ array',
      });
    }

    const shopId = products[0]?.shop_id;

    if (!shopId) {
      return res.status(400).json({
        code: 4001,
        message: 'shop_id ไม่ถูกต้องหรือหายไป',
      });
    }

    const existingProducts = await Product.findAll({
      where: {
        product_id: products.map((p) => p.product_id),
        shop_id: shopId,
        deleted_at: null,
      },
    });

    const existingProductIds = existingProducts.map((p) => p.product_id);

    const newProducts = products.filter((p) => !existingProductIds.includes(p.product_id));

    if (newProducts.length === 0) {
      return res.status(409).json({
        code: 4090,
        message: 'สินค้าทั้งหมดมีอยู่ในร้านแล้ว',
        existingProducts: existingProductIds,
      });
    }

    const now = new Date();
    const productsToCreate = newProducts.map((p) => ({
      product_uid: p.product_uid || require('uuid').v4(), // สร้าง UUID ถ้าไม่มี
      product_id: p.product_id,
      product_name: p.product_name,
      shop_id: p.shop_id,
      description: p.description || null,
      price: p.price,
      is_active: p.is_active || 'ACTIVE',
      stock: p.stock || 0,
      image_url: p.image_url || null,
      category_id: p.category_id || null,
      supplier_id: p.supplier_id || null,
      warehouse_id: p.warehouse_id || null,
      created_at: now,
      updated_at: now,
    }));

    const createdProducts = await Product.bulkCreate(productsToCreate);

    return res.status(201).json({
      code: 1000,
      message: 'เพิ่มสินค้าสำเร็จ',
      data: {
        created: createdProducts.length,
        skipped: existingProducts.length,
        products: createdProducts,
        existingProductIds,
      },
    });
  } catch (error) {
    console.error('ข้อผิดพลาดในการเพิ่มสินค้า:', error);
    return res.status(500).json({
      code: 5000,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
    });
  }
};

const updateProduct = async (req, res) => {
  const { product_uid, product_id, product_name, price, description, shop_id, stock, is_active, category_id, supplier_id, warehouse_id } = req.body;
  const userId = req.user?.id;
  const image = req.files?.productImage || null;
  let productImage = null;

  if (!userId) {
    return res.status(401).json({ code: 401, message: 'ต้องล็อกอินเพื่ออัปเดตสินค้า' });
  }
  try {
    const updateData = {
      product_id,
      product_name,
      price,
      description,
      stock,
      is_active,
      category_id,
      supplier_id,
      warehouse_id,
      updated_at: new Date(),
    };
    if (image) {
      productImage = await uploadImage(image, `product_image/${shop_id}-${product_id}`);
      updateData.image_url = productImage;
    }

    const updatedProduct = await Product.update(updateData, {
      where: { product_uid, shop_id, deleted_at: null },
    });

    if (updatedProduct[0] === 0) {
      return res.status(404).json({
        code: 404,
        message: 'ไม่พบสินค้าที่ต้องการอัปเดต',
      });
    }
    return res.status(200).json({
      code: 1000,
      message: 'อัปเดตสินค้าสำเร็จ',
    });
  } catch (error) {
    console.error('ข้อผิดพลาดในการอัปเดตสินค้า:', error);
    return res.status(500).json({
      code: 5000,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
    });
  }
};

const deleteProduct = async (req, res) => {
  const { product_uid, shop_id } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ code: 401, message: 'ต้องล็อกอินเพื่อลบสินค้า' });
  }
  try {
    const deletedProduct = await Product.update(
      {
        deleted_at: new Date(),
        is_active: 'INACTIVE',
      },
      {
        where: { product_uid, shop_id, deleted_at: null },
      }
    );

    if (deletedProduct[0] === 0) {
      return res.status(404).json({
        code: 404,
        message: 'ไม่พบสินค้าที่ต้องการลบ',
      });
    }

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

const productDetail = async (req, res) => {
  const { product_uid, shop_id } = req.body;

  try {
    const product = await Product.findOne({
      where: { product_uid, shop_id, deleted_at: null },
      include: [
        { model: Warehouse, attributes: ['warehouse_id', 'name', 'location'] },
        { model: Category, attributes: ['category_id', 'cat_name'] },
        { model: Supplier, attributes: ['supplier_id', 'name'] },
      ],
    });

    if (!product) {
      return res.status(404).json({
        code: 404,
        message: 'ไม่พบสินค้า',
      });
    }

    const imageUrl = product.image_url
      ? `${req.protocol}://${req.get('host')}/uploads/${product.image_url}`
      : null;

    return res.status(200).json({
      code: 1000,
      datarow: {
        ...product.toJSON(),
        image_url: imageUrl,
      },
    });
  } catch (error) {
    console.error('ข้อผิดพลาดในการดึงข้อมูลสินค้า:', error);
    return res.status(500).json({
      code: 5000,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
    });
  }
};

export { getmyproduct, createProduct, updateProduct, deleteProduct, productDetail };