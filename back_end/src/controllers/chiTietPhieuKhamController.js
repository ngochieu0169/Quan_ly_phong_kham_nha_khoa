
// controllers/chiTietPhieuKhamController.js
const db = require('../configs/database');

// GET all chi tiết cho tất cả phiếu
exports.getAll = (req, res) => {
  const sql = `
    SELECT CTPK.*, DV.tenDichVu, DV.donGia
    FROM CHITIETPHIEUKHAM CTPK
    JOIN DICHVU DV ON CTPK.maDichVu = DV.maDichVu
  `;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

// GET chi tiết theo (maPhieuKham, maDichVu)
exports.getById = (req, res) => {
  const { maPhieuKham, maDichVu } = req.params;
  db.query(
    `SELECT * FROM CHITIETPHIEUKHAM WHERE maPhieuKham = ? AND maDichVu = ?`,
    [maPhieuKham, maDichVu],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      if (rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy chi tiết' });
      res.json(rows[0]);
    }
  );
};

// CREATE chi tiết mới
exports.create = (req, res) => {
  const { maPhieuKham, maDichVu, soLuong, ghiChu } = req.body;
  db.query(
    `INSERT INTO CHITIETPHIEUKHAM (maPhieuKham, maDichVu, soLuong, ghiChu) VALUES (?, ?, ?, ?)`,
    [maPhieuKham, maDichVu, soLuong, ghiChu],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Thêm chi tiết phiếu khám thành công' });
    }
  );
};

// UPDATE chi tiết
exports.update = (req, res) => {
  const { maPhieuKham, maDichVu } = req.params;
  const { soLuong, ghiChu } = req.body;
  db.query(
    `UPDATE CHITIETPHIEUKHAM SET soLuong = ?, ghiChu = ? WHERE maPhieuKham = ? AND maDichVu = ?`,
    [soLuong, ghiChu, maPhieuKham, maDichVu],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy chi tiết' });
      res.json({ message: 'Cập nhật thành công' });
    }
  );
};

// DELETE chi tiết
exports.delete = (req, res) => {
  const { maPhieuKham, maDichVu } = req.params;
  db.query(
    `DELETE FROM CHITIETPHIEUKHAM WHERE maPhieuKham = ? AND maDichVu = ?`,
    [maPhieuKham, maDichVu],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy chi tiết' });
      res.json({ message: 'Xóa thành công' });
    }
  );
};
