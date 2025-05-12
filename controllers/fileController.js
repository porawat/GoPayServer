const mysql = require('mysql2/promise');
const path = require('path');
const dbConfig = require('../config/db');

const uploadFile = async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: 'No files were uploaded' });
    }

    const file = req.files.file;
    const projectName = req.body.projectName;
    const uploadDir = path.join(__dirname, '../uploads');
    const filePath = path.join(uploadDir, file.name);

    await file.mv(filePath);

    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      'INSERT INTO ifc_files_lab (file_name, file_size, project_name, uploaded_by, file_path, upload_date) VALUES (?, ?, ?, ?, ?, NOW())',
      [file.name, file.size, projectName, req.user.id, filePath]
    );

    res.status(201).json({
      message: 'File uploaded successfully',
      fileId: result.insertId,
      fileName: file.name,
    });

    await connection.end();
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const listFiles = async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT id, file_name, file_size, project_name, uploaded_by, upload_date FROM ifc_files_lab WHERE uploaded_by = ?',
      [req.user.id]
    );
    res.json(rows);
    await connection.end();
  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteFile = async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(
      'DELETE FROM ifc_files_lab WHERE id = ? AND uploaded_by = ?',
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'File not found or not authorized' });
    }
    res.json({ message: 'File deleted successfully' });
    await connection.end();
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { uploadFile, listFiles, deleteFile };