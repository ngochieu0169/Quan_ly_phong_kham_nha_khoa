const db = require('../configs/database');

// GET all
exports.getAll = (req, res) => {
  db.query('SELECT * FROM LOAIDICHVU', (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
};

// GET by ID
exports.getById = (req, res) => {
  db.query('SELECT * FROM LOAIDICHVU WHERE maLoaiDichVu = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ message: 'Không tìm thấy loại dịch vụ' });
    res.json(result[0]);
  });
};

// CREATE
exports.create = (req, res) => {
  const { tenLoaiDichVu } = req.body;
  db.query('INSERT INTO LOAIDICHVU (tenLoaiDichVu) VALUES (?)', [tenLoaiDichVu], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Thêm loại dịch vụ thành công' });
  });
};

// UPDATE
exports.update = (req, res) => {
  const { tenLoaiDichVu } = req.body;
  db.query('UPDATE LOAIDICHVU SET tenLoaiDichVu = ? WHERE maLoaiDichVu = ?', [tenLoaiDichVu, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy loại dịch vụ' });
    res.json({ message: 'Cập nhật thành công' });
  });
};

// DELETE
exports.delete = (req, res) => {
  db.query('DELETE FROM LOAIDICHVU WHERE maLoaiDichVu = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy loại dịch vụ' });
    res.json({ message: 'Xóa thành công' });
  });
};
