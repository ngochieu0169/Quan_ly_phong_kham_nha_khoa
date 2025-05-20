// controllers/danhGiaController.js
const db = require('../configs/database');

// Lấy tất cả đánh giá
exports.getAll = (req, res) => {
  const sql = 'SELECT * FROM DANHGIA ORDER BY NgayDanhGia DESC';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Lấy đánh giá theo mã
exports.getById = (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM DANHGIA WHERE maDanhGia = ?';
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    }
    res.json(results[0]);
  });
};

// Thêm đánh giá mới
exports.create = (req, res) => {
  const { maPhongKham, tenTaiKhoan, danhGia, binhLuan, NgayDanhGia } = req.body;
  const sql = `
    INSERT INTO DANHGIA (maPhongKham, tenTaiKhoan, danhGia, binhLuan, NgayDanhGia)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(
    sql,
    [maPhongKham, tenTaiKhoan, danhGia, binhLuan, NgayDanhGia],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Thêm đánh giá thành công' });
    }
  );
};

// Cập nhật đánh giá
exports.update = (req, res) => {
  const { id } = req.params;
  const { danhGia, binhLuan, NgayDanhGia } = req.body;
  const sql = `
    UPDATE DANHGIA
    SET danhGia = ?, binhLuan = ?, NgayDanhGia = ?
    WHERE maDanhGia = ?
  `;
  db.query(sql, [danhGia, binhLuan, NgayDanhGia, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    }
    res.json({ message: 'Cập nhật đánh giá thành công' });
  });
};

// Xóa đánh giá
exports.delete = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM DANHGIA WHERE maDanhGia = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    }
    res.json({ message: 'Xóa đánh giá thành công' });
  });
};
