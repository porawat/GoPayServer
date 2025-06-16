// controllers/warehouseController.js
import db from '../db/index.js';

export const getWarehouses = async (req, res) => {
  try {
    const { shopId } = req.query;
    if (!shopId) {
      return res.status(400).json({ code: 1001, message: 'shopId is required' });
    }

    const query = `
      SELECT warehouse_id, name, location
      FROM warehouse
      WHERE shop_id = ? AND deleted_at IS NULL
    `;
    const [rows] = await db.query(query, [shopId]);

    res.status(200).json({
      code: 1000,
      datarow: rows,
      message: 'Success',
    });
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    res.status(500).json({ code: 1002, message: 'Internal server error' });
  }
};