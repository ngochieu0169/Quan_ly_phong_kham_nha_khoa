// controllers/hoaDonController.js
const db = require('../configs/database');

// GET all hoá đơn
exports.getAll = (req, res) => {
  db.query('SELECT * FROM HOADON', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

// GET hoá đơn theo ID
exports.getById = (req, res) => {
  db.query('SELECT * FROM HOADON WHERE maHoaDon = ?', [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy hoá đơn' });
    res.json(rows[0]);
  });
};

// CREATE hoá đơn
exports.create = (req, res) => {
  const { soTien, phuongThuc, trangThai, ngaytao, ngayThanhToan, maPhieuKham } = req.body;
  db.query(
    `INSERT INTO HOADON (soTien, phuongThuc, trangThai, ngaytao, ngayThanhToan, maPhieuKham)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [soTien, phuongThuc, trangThai, ngaytao, ngayThanhToan, maPhieuKham],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Tạo hoá đơn thành công', maHoaDon: result.insertId });
    }
  );
};

// UPDATE hoá đơn
exports.update = (req, res) => {
  const { id } = req.params;
  const { soTien, phuongThuc, trangThai, ngaytao, ngayThanhToan, maPhieuKham } = req.body;
  db.query(
    `UPDATE HOADON
     SET soTien = ?, phuongThuc = ?, trangThai = ?, ngaytao = ?, ngayThanhToan = ?, maPhieuKham = ?
     WHERE maHoaDon = ?`,
    [soTien, phuongThuc, trangThai, ngaytao, ngayThanhToan, maPhieuKham, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy hoá đơn' });
      res.json({ message: 'Cập nhật thành công' });
    }
  );
};

// DELETE hoá đơn
exports.delete = (req, res) => {
  db.query('DELETE FROM HOADON WHERE maHoaDon = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy hoá đơn' });
    res.json({ message: 'Xóa thành công' });
  });
};
