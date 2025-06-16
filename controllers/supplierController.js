import db from '../db/index.js';

export const getSuppliers = async (req, res) => {
  try {
    const query = `
      SELECT supplier_id, name, contact_info
      FROM supplier
      WHERE status = 'ACTIVE' AND deleted_at IS NULL
    `;
    const [rows] = await db.query(query);
    console.log('Suppliers fetched:', JSON.stringify(rows, null, 2));

    res.status(200).json({
      code: 1000,
      datarow: rows,
      message: 'Success',
    });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ code: 1002, message: 'Internal server error' });
  }
};