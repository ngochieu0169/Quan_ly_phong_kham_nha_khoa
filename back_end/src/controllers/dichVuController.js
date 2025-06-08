const db = require('../configs/database');

// GET all
exports.getAll = (req, res) => {
  db.query(`SELECT D.*, L.tenLoaiDichVu 
            FROM DICHVU D 
            JOIN LOAIDICHVU L ON D.maLoaiDichVu = L.maLoaiDichVu`, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ data: result });
  });
};

// SEARCH services
exports.search = (req, res) => {
  const { q, type } = req.query;
  let sql = `SELECT D.*, L.tenLoaiDichVu 
             FROM DICHVU D 
             JOIN LOAIDICHVU L ON D.maLoaiDichVu = L.maLoaiDichVu`;
  let params = [];
  let conditions = [];

  if (q) {
    conditions.push('(D.tenDichVu LIKE ? OR D.moTa LIKE ?)');
    params.push(`%${q}%`, `%${q}%`);
  }

  if (type) {
    conditions.push('D.maLoaiDichVu = ?');
    params.push(type);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' ORDER BY D.tenDichVu';

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ data: result });
  });
};

// GET services by type
exports.getByType = (req, res) => {
  const typeId = req.params.typeId;
  db.query(`SELECT D.*, L.tenLoaiDichVu 
            FROM DICHVU D 
            JOIN LOAIDICHVU L ON D.maLoaiDichVu = L.maLoaiDichVu 
            WHERE D.maLoaiDichVu = ?
            ORDER BY D.tenDichVu`, [typeId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ data: result });
  });
};

// GET by ID
exports.getById = (req, res) => {
  db.query(`SELECT D.*, L.tenLoaiDichVu 
            FROM DICHVU D 
            JOIN LOAIDICHVU L ON D.maLoaiDichVu = L.maLoaiDichVu 
            WHERE D.maDichVu = ?`, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ message: 'Không tìm thấy dịch vụ' });
    res.json({ data: result[0] });
  });
};

// CREATE
exports.create = (req, res) => {
  const { tenDichVu, moTa, donGia, maLoaiDichVu } = req.body;
  const anh = req.file ? `/uploads/${req.file.filename}` : null;

  db.query(`INSERT INTO DICHVU (tenDichVu, moTa, donGia, anh, maLoaiDichVu) 
            VALUES (?, ?, ?, ?, ?)`, [tenDichVu, moTa, donGia, anh, maLoaiDichVu], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({
      message: 'Thêm dịch vụ thành công',
      data: { maDichVu: result.insertId }
    });
  });
};

// UPDATE
exports.update = (req, res) => {
  const { tenDichVu, moTa, donGia, maLoaiDichVu } = req.body;
  let anh = req.body.anh; // Keep existing image if no new file

  if (req.file) {
    anh = `/uploads/${req.file.filename}`;
  }

  db.query(`UPDATE DICHVU 
            SET tenDichVu = ?, moTa = ?, donGia = ?, anh = ?, maLoaiDichVu = ?
            WHERE maDichVu = ?`, [tenDichVu, moTa, donGia, anh, maLoaiDichVu, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy dịch vụ' });
    res.json({ message: 'Cập nhật dịch vụ thành công' });
  });
};

// DELETE
exports.delete = (req, res) => {
  db.query('DELETE FROM DICHVU WHERE maDichVu = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy dịch vụ' });
    res.json({ message: 'Xóa dịch vụ thành công' });
  });
};
