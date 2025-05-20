const db = require('../configs/database');

// GET all
exports.getAll = (req, res) => {
  db.query(`SELECT D.*, L.tenLoaiDichVu 
            FROM DICHVU D 
            JOIN LOAIDICHVU L ON D.maLoaiDichVu = L.maLoaiDichVu`, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
};

// GET by ID
exports.getById = (req, res) => {
  db.query('SELECT * FROM DICHVU WHERE maDichVu = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ message: 'Không tìm thấy dịch vụ' });
    res.json(result[0]);
  });
};

// CREATE
exports.create = (req, res) => {
  const { tenDichVu, moTa, donGia, anh, maLoaiDichVu } = req.body;
  db.query(`INSERT INTO DICHVU (tenDichVu, moTa, donGia, anh, maLoaiDichVu) 
            VALUES (?, ?, ?, ?, ?)`, [tenDichVu, moTa, donGia, anh, maLoaiDichVu], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Thêm dịch vụ thành công' });
  });
};

// UPDATE
exports.update = (req, res) => {
  const { tenDichVu, moTa, donGia, anh, maLoaiDichVu } = req.body;
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
