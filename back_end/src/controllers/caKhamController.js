const db = require('../configs/database');

// Lấy tất cả ca khám
exports.getAll = (req, res) => {
  const sql = `SELECT CK.*, NS.hoTen 
               FROM CAKHAM CK
               JOIN NHASI NS ON CK.maNhaSi = NS.maNhaSi`;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
};

// Lấy ca khám theo ID
exports.getById = (req, res) => {
  db.query('SELECT * FROM CAKHAM WHERE maCaKham = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ message: 'Không tìm thấy ca khám' });
    res.json(result[0]);
  });
};

// Tạo ca khám mới
exports.create = (req, res) => {
  const { ngayKham, gioBatDau, gioKetThuc, moTa, maNhaSi } = req.body;
  const sql = `INSERT INTO CAKHAM (ngayKham, gioBatDau, gioKetThuc, moTa, maNhaSi) 
               VALUES (?, ?, ?, ?, ?)`;
  db.query(sql, [ngayKham, gioBatDau, gioKetThuc, moTa, maNhaSi], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Thêm ca khám thành công' });
  });
};

// Cập nhật ca khám
exports.update = (req, res) => {
  const { ngayKham, gioBatDau, gioKetThuc, moTa, maNhaSi } = req.body;
  const sql = `UPDATE CAKHAM 
               SET ngayKham = ?, gioBatDau = ?, gioKetThuc = ?, moTa = ?, maNhaSi = ? 
               WHERE maCaKham = ?`;
  db.query(sql, [ngayKham, gioBatDau, gioKetThuc, moTa, maNhaSi, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy ca khám' });
    res.json({ message: 'Cập nhật thành công' });
  });
};

// Xóa ca khám
exports.delete = (req, res) => {
  db.query('DELETE FROM CAKHAM WHERE maCaKham = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy ca khám' });
    res.json({ message: 'Xóa ca khám thành công' });
  });
};
