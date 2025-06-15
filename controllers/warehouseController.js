import db from '../db/index.js';
const { Warehouse } = db;

const getWarehouses = async (req, res) => {
  const { shopId } = req.params;
  try {
    const warehouses = await Warehouse.findAll({
      where: { shop_id: shopId, deleted_at: null, status: 'ACTIVE' },
      attributes: ['warehouse_id', 'name', 'location'],
    });
    return res.status(200).json({
      code: 1000,
      datarow: warehouses,
    });
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    return res.status(500).json({
      code: 5000,
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
    });
  }
};

export { getWarehouses };