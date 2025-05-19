import db from '../db/index.js';
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
            code: 500,
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

export { getmyproduct, createProduct };