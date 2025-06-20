import db from '../db/index.js';
const {Supplier} = db;
 const getSuppliers = async (req, res) => {
  try {
    const result = await Supplier.findAll();
    // console.log('Suppliers fetched:', JSON.stringify(result, null, 2));

    res.status(200).json({ // <-- แก้จาก satus เป็น status
      code: 1000,
      datarow: result,
      message: 'Success',
    });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ code: 5000, message: 'Internal server error' });
  }
};
export {getSuppliers}