const db = require('../configs/database');

// GET danh sách Lịch Khám kèm info con
exports.getAll = (req, res) => {
  const sql = `
    SELECT 
      LK.*,
      BN.hoTen AS benhNhanHoTen,
      TK.maQuyen, TK.tenTaiKhoan AS nguoiDatTK, 
      CK.ngayKham, CK.gioBatDau, CK.gioKetThuc, CK.moTa AS caKhamMoTa
    FROM LICHKHAM LK
    JOIN NGUOIDUNG BN ON LK.maBenhNhan = BN.maNguoiDung
    JOIN TAIKHOAN   TK ON LK.maNguoiDat = TK.tenTaiKhoan
    JOIN CAKHAM     CK ON LK.maCaKham   = CK.maCaKham
    ORDER BY LK.ngayDatLich DESC
  `;
  db.query(sql, (err, lichs) => {
    if (err) return res.status(500).json({ error: err.message });
    const ids = lichs.map(l => l.maLichKham);
    if (ids.length === 0) return res.json([]);
    db.query(
      `SELECT * FROM PHIEUKHAM WHERE maLichKham IN (?)`, 
      [ids], 
      (err2, phieus) => {
        if (err2) return res.status(500).json({ error: err2.message });
        // nhóm phiếu theo lịch
        const map = phieus.reduce((a,p) => {
          a[p.maLichKham] = a[p.maLichKham]||[];
          a[p.maLichKham].push(p);
          return a;
        }, {});
        // gắn vào
        const result = lichs.map(lk => ({
          ...lk,
          phieuKhams: map[lk.maLichKham]||[]
        }));
        res.json(result);
      }
    );
  });
};

// GET chi tiết 1 Lịch Khám
exports.getById = (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT 
      LK.*,
      BN.*, 
      TK.tenTaiKhoan AS nguoiDatTK, TK.maQuyen,
      CK.ngayKham, CK.gioBatDau, CK.gioKetThuc, CK.moTa AS caKhamMoTa
    FROM LICHKHAM LK
    JOIN NGUOIDUNG BN ON LK.maBenhNhan = BN.maNguoiDung
    JOIN TAIKHOAN   TK ON LK.maNguoiDat = TK.tenTaiKhoan
    JOIN CAKHAM     CK ON LK.maCaKham   = CK.maCaKham
    WHERE LK.maLichKham = ?
  `;
  db.query(sql, [id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy lịch' });
    const lich = rows[0];
    db.query(
      `SELECT * FROM PHIEUKHAM WHERE maLichKham = ?`, 
      [id], 
      (err2, phieus) => {
        if (err2) return res.status(500).json({ error: err2.message });
        lich.phieuKhams = phieus;
        res.json(lich);
      }
    );
  });
};

// POST tạo Lịch Khám
exports.create = (req, res) => {
  const { ngayDatLich, trieuChung, trangThai, maBenhNhan, maNguoiDat, quanHeBenhNhanVaNguoiDat, maCaKham } = req.body;

    // Chuyển đổi định dạng từ "DD-MM-YYYY" → "YYYY-MM-DD"
    const [day, month, year] = ngayDatLich.split("-");
    const formattedNgayKham = `${year}-${month}-${day}`;

  const sql = `
    INSERT INTO LICHKHAM
      (ngayDatLich, trieuChung, trangThai, maBenhNhan, maNguoiDat, quanHeBenhNhanVaNguoiDat, maCaKham)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(
    sql,
    [formattedNgayKham, trieuChung, trangThai, maBenhNhan, maNguoiDat, quanHeBenhNhanVaNguoiDat, maCaKham],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Tạo lịch khám thành công', maLichKham: result.insertId });
    }
  );
};

// PUT cập nhật Lịch Khám
// exports.update = (req, res) => {
//   const { id } = req.params;
//   const { ngayDatLich, trieuChung, trangThai, maBenhNhan, maNguoiDat, quanHeBenhNhanVaNguoiDat, maCaKham } = req.body;
//   const sql = `
//     UPDATE LICHKHAM SET
//       ngayDatLich = ?, trieuChung = ?, trangThai = ?, maBenhNhan = ?, maNguoiDat = ?, quanHeBenhNhanVaNguoiDat = ?, maCaKham = ?
//     WHERE maLichKham = ?
//   `;
//   db.query(
//     sql,
//     [ngayDatLich, trieuChung, trangThai, maBenhNhan, maNguoiDat, quanHeBenhNhanVaNguoiDat, maCaKham, id],
//     (err, result) => {
//       if (err) return res.status(500).json({ error: err.message });
//       if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy lịch' });
//       res.json({ message: 'Cập nhật lịch khám thành công' });
//     }
//   );
// };

// PUT /api/lich-kham/:id
exports.confirmBooking = (req, res) => {
  const { id } = req.params;           // id = maLichKham
  const { trangThai } = req.body;     // expect "xác nhận"

  const sql = `
    UPDATE LICHKHAM
    SET trangThai = ?
    WHERE maLichKham = ?
  `;
  db.query(sql, [trangThai, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy lịch khám" });
    }
    res.json({ message: "Xác nhận lịch thành công" });
  });
};


// DELETE Lịch Khám
exports.delete = (req, res) => {
  const { id } = req.params;
  db.query(`DELETE FROM LICHKHAM WHERE maLichKham = ?`, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy lịch' });
    res.json({ message: 'Xóa lịch khám thành công' });
  });
};
