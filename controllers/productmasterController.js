import db from '../db/index.js';
const { ProductMaster } = db;

const createProductMaster = async (req, res) => {
    const { sku, name, description, category_id, supplier_id,
        cost_price, selling_price, reorder_level, image_url } = req.body;
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ code: 401, message: 'ต้องล็อกอินเพื่อเพิ่มสินค้า' });
    }

    try {
        const newProductMaster = await ProductMaster.create({
            sku: sku,
            name: name,
            description: description,
            category_id: category_id,
            supplier_id: supplier_id,
            cost_price: cost_price,
            selling_price: selling_price,
            reorder_level: reorder_level,
            image_url: image_url,
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

        const productList = await db.ProductMaster.findAll({
            where: {
                status: 'ACTIVE',
            },
        });
        return res.status(200).json({
            code: 1000,
            message: 'ดึงข้อมูลหมวดหมู่สำเร็จ',
            data: productList || [],
        });
    }
    catch (error) {
        console.error('ข้อผิดพลาดในการดึงข้อมูลหมวดหมู่:', error);
        return res.status(500).json({
            code: 5000,
            message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
        });
    }


};

const getProductMasterbyId = async (req, res) => {
    const category_id = req.params.category_id;

    let whatsearch;
    if (category_id === "all") {
        whatsearch = {
            status: 'ACTIVE',
        }
    } else {
        whatsearch = {
            category_id: category_id,
            status: 'ACTIVE',
        }
    }
    try {
        const productList = await db.ProductMaster.findAll({
            where: whatsearch
        }, {
            include: [{ model: db.Category, as: 'category' }]
        });
        return res.status(200).json({
            code: 1000,
            message: 'ดึงข้อมูลหมวดหมู่สำเร็จ',
            data: productList || [],
        });
    } catch (error) {
        console.error('ข้อผิดพลาดในการดึงข้อมูลหมวดหมู่:', error);
        return res.status(500).json({
            code: 5000,
            message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
        });
    }
}


export { createProductMaster, getProductMasterList, getProductMasterbyId };