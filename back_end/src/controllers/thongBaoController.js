const db = require('../configs/database');

// GET all thong bao kèm thông tin tài khoản người nhận
exports.getAllThongBao = (req, res) => {
  const sql = `
    SELECT tb.maThongBao, tb.maNguoiNhan, tb.tieuDe, tb.noiDung, tb.ngayTao, tk.tenTaiKhoan, nd.hoTen, nd.eMail as email
    FROM THONGBAO tb
    LEFT JOIN TAIKHOAN tk ON tb.maNguoiNhan = tk.tenTaiKhoan
    LEFT JOIN NGUOIDUNG nd ON tk.maNguoiDung = nd.maNguoiDung
    ORDER BY tb.ngayTao DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// GET thong bao theo maThongBao
exports.getThongBaoById = (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT tb.maThongBao, tb.maNguoiNhan, tb.tieuDe, tb.noiDung, tb.ngayTao, tk.tenTaiKhoan, nd.hoTen, nd.eMail as email
    FROM THONGBAO tb
    LEFT JOIN TAIKHOAN tk ON tb.maNguoiNhan = tk.tenTaiKhoan
    LEFT JOIN NGUOIDUNG nd ON tk.maNguoiDung = nd.maNguoiDung
    WHERE tb.maThongBao = ?
  `;
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Thông báo không tồn tại' });
    res.json(results[0]);
  });
};

// CREATE thong bao
exports.createThongBao = (req, res) => {
  const { maNguoiNhan, tieuDe, noiDung } = req.body;
  const ngayTao = new Date();
  if (!maNguoiNhan || !tieuDe || !noiDung) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
  }
  const sql = `INSERT INTO THONGBAO (maNguoiNhan, tieuDe, noiDung, ngayTao) VALUES (?, ?, ?, ?)`;
  db.query(sql, [maNguoiNhan, tieuDe, noiDung, ngayTao], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Tạo thông báo thành công', maThongBao: result.insertId });
  });
};

// UPDATE thong bao theo maThongBao
exports.updateThongBao = (req, res) => {
  const { id } = req.params;
  const { maNguoiNhan, tieuDe, noiDung } = req.body;
  if (!maNguoiNhan || !tieuDe || !noiDung) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
  }
  const sql = `UPDATE THONGBAO SET maNguoiNhan = ?, tieuDe = ?, noiDung = ? WHERE maThongBao = ?`;
  db.query(sql, [maNguoiNhan, tieuDe, noiDung, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Thông báo không tồn tại' });
    res.json({ message: 'Cập nhật thông báo thành công' });
  });
};

// DELETE thong bao theo maThongBao
exports.deleteThongBao = (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM THONGBAO WHERE maThongBao = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Thông báo không tồn tại' });
    res.json({ message: 'Xóa thông báo thành công' });
  });
};
