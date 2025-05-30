import db from '../db/index.js';
import uploadImage from '../provider/upload.js';
const { product, } = db;




const getmyproduct = async (req, res) => {
    const userId = req.user?.id;
    const { shopId } = req.params;
    if (!userId) {
        return res.status(401).json({ code: 401, message: 'ต้องล็อกอินเพื่อดึงข้อมูลร้านค้า' });
    }
    try {
        const products = await product.findAll({
            where: { shop_id: shopId },

        });
        return res.status(200).json({
            code: 1000,
            datarow: products || [],
        });
    } catch (error) {
        console.error('ข้อผิดพลาดในการดึงข้อมูลร้านค้า:', error);
        return res.status(500).json({
            code: 5000,
            message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
        });
    }
};

const createProduct = async (req, res) => {
    const { product_name, product_id, price, description, shop_id } = req.body;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ code: 401, message: 'ต้องล็อกอินเพื่อเพิ่มสินค้า' });
    }

    try {
        // Check for existing product with same product_id and shop_id
        const existingProduct = await product.findOne({
            where: {
                product_id: product_id,
                shop_id: shop_id
            }
        });

        if (existingProduct) {
            return res.status(409).json({
                code: 5000,
                message: 'สินค้านี้มีอยู่ในร้านนี้แล้ว',
                data: existingProduct
            });
        }

        const newProduct = await product.create({
            product_id: product_id,
            shop_id: shop_id,
            product_name: product_name,
            price: price,
            description: description,
        });

        return res.status(201).json({
            code: 1000,
            message: 'เพิ่มสินค้าสำเร็จ',
            data: newProduct,
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
    const { product_id, product_name, price, description, shop_id, stock, is_active, product_uid } = req.body;
    const userId = req.user?.id;
    const image = req.files?.productImage || null;
    let productImage = null;

    if (!userId) {
        return res.status(401).json({ code: 401, message: 'ต้องล็อกอินเพื่ออัปเดตสินค้า' });
    }
    try {
        const updateData = {
            product_name,
            price,
            description,
            stock,
            is_active,
            updated_at: new Date(),
        };
        // ✅ ถ้ามีการอัปโหลดรูป ค่อยเพิ่ม image_url เข้าไป
        if (image) {
            productImage = await uploadImage(image, `product_image/${shop_id}-${product_id}`);
            updateData.image_url = productImage;
        }

        const updatedProduct = await product.update(updateData, {
            where: { product_uid },
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
    const { product_id, shop_id } = req.body;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ code: 401, message: 'ต้องล็อกอินเพื่ออัปเดตสินค้า' });
    }
    try {
        const deletedProduct = await product.update({
            deleted_at: new Date(),
            is_active: 'INACTIVE',
            where: { product_id, shop_id }
        });

        if (deletedProduct === 0) {
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
    const { product_id, shop_id } = req.body;

    try {
        const products = await product.findOne({
            where: { shop_id, product_id },
        });

        if (!products) {
            return res.status(404).json({
                code: 404,
                message: 'ไม่พบสินค้า',
            });
        }

        // ✅ สร้าง image_url แบบเต็ม
        const imageUrl = products.image_url
            ? `${req.protocol}://${req.get('host')}/uploads/${products.image_url}`
            : null;

        return res.status(200).json({
            code: 1000,
            datarow: {
                ...products.toJSON(),
                image_url: imageUrl, // แทนที่ image_url เดิม
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