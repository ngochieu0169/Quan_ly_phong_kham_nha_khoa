// controllers/phongKhamController.js
const db = require('../configs/database');

// Lấy tất cả phòng khám
exports.getAll = (req, res) => {
  const sql = `SELECT * FROM PHONGKHAM`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Lấy 1 phòng khám theo ID
exports.getById = (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM PHONGKHAM WHERE maPhongKham = ?`;
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(404).json({ message: 'Không tìm thấy phòng khám' });
    res.json(results[0]);
  });
};

// Tạo mới phòng khám
exports.create = (req, res) => {
  const { tenPhongKham, diaChi, soDienThoai, gioLamViec, maChuPhongKham, trangthai } = req.body;
  const sql = `
    INSERT INTO PHONGKHAM
      (tenPhongKham, diaChi, soDienThoai, gioLamViec, maChuPhongKham, trangthai)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(
    sql,
    [tenPhongKham, diaChi, soDienThoai, gioLamViec, maChuPhongKham, trangthai],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({
        message: 'Tạo phòng khám thành công',
        maPhongKham: result.insertId,
      });
    }
  );
};

// Cập nhật phòng khám
exports.update = (req, res) => {
  const { id } = req.params;
  const { tenPhongKham, diaChi, soDienThoai, gioLamViec, maChuPhongKham, trangthai } = req.body;
  const sql = `
    UPDATE PHONGKHAM
    SET tenPhongKham = ?, diaChi = ?, soDienThoai = ?, gioLamViec = ?, maChuPhongKham = ?, trangthai = ?
    WHERE maPhongKham = ?
  `;
  db.query(
    sql,
    [tenPhongKham, diaChi, soDienThoai, gioLamViec, maChuPhongKham, trangthai, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0)
        return res.status(404).json({ message: 'Không tìm thấy phòng khám' });
      res.json({ message: 'Cập nhật phòng khám thành công' });
    }
  );
};

// Xóa phòng khám
exports.delete = (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM PHONGKHAM WHERE maPhongKham = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Không tìm thấy phòng khám' });
    res.json({ message: 'Xóa phòng khám thành công' });
  });
};
