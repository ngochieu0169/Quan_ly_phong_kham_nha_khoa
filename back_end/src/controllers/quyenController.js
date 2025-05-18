const Quyen = require('../models/quyenModel');

exports.getAll = (req, res) => {
  Quyen.getAll((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

exports.getById = (req, res) => {
  Quyen.getById(req.params.id, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Không tìm thấy quyền' });
    res.json(results[0]);
  });
};

exports.create = (req, res) => {
  const { tenQuyen } = req.body;
  if (!tenQuyen) return res.status(400).json({ message: 'tenQuyen là bắt buộc' });

  Quyen.create(tenQuyen, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Thêm quyền thành công', maQuyen: result.insertId });
  });
};

exports.update = (req, res) => {
  const { tenQuyen } = req.body;
  const { id } = req.params;
  if (!tenQuyen) return res.status(400).json({ message: 'tenQuyen là bắt buộc' });

  Quyen.update(id, tenQuyen, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Cập nhật quyền thành công' });
  });
};

exports.delete = (req, res) => {
  Quyen.delete(req.params.id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Xóa quyền thành công' });
  });
};
