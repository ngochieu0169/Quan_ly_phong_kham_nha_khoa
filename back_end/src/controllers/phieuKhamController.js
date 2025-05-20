const db = require('../configs/database');

// GET all Phiếu Khám (kèm chi tiết dịch vụ + hoá đơn)
exports.getAll = (req, res) => {
    // 1) Lấy list phiếu khám cơ bản (vẫn như cũ)
    const sqlMain = `
      SELECT 
        PK.*,
        LK.ngayDatLich, LK.trieuChung, LK.trangThai AS trangThaiLich,
        BN.hoTen AS benhNhanHoTen,
        TK.tenTaiKhoan AS nguoiDatTK,
        CK.ngayKham, CK.gioBatDau, CK.gioKetThuc
      FROM PHIEUKHAM PK
      JOIN LICHKHAM LK ON PK.maLichKham = LK.maLichKham
      JOIN NGUOIDUNG BN ON LK.maBenhNhan   = BN.maNguoiDung
      JOIN TAIKHOAN TK ON LK.maNguoiDat    = TK.tenTaiKhoan
      JOIN CAKHAM CK ON LK.maCaKham        = CK.maCaKham
      ORDER BY PK.maPhieuKham DESC
    `;
    db.query(sqlMain, (err, phieus) => {
      if (err) return res.status(500).json({ error: err.message });
      const ids = phieus.map(p => p.maPhieuKham);
      if (ids.length === 0) return res.json([]);
  
      // 2) Fetch CHITIETPHIEUKHAM cho tất cả phiếu
      const sqlCT = `SELECT CTPK.*, DV.tenDichVu, DV.donGia 
                     FROM CHITIETPHIEUKHAM CTPK
                     JOIN DICHVU DV ON CTPK.maDichVu = DV.maDichVu
                     WHERE CTPK.maPhieuKham IN (?)`;
      db.query(sqlCT, [ids], (err2, ctList) => {
        if (err2) return res.status(500).json({ error: err2.message });
  
        // 3) Fetch HOADON cho tất cả phiếu
        const sqlHD = `SELECT * FROM HOADON WHERE maPhieuKham IN (?)`;
        db.query(sqlHD, [ids], (err3, hdList) => {
          if (err3) return res.status(500).json({ error: err3.message });
  
          // 그룹 danh sách chi tiết và hoá đơn theo phiếu
          const mapCT = ctList.reduce((acc, x) => {
            acc[x.maPhieuKham] = acc[x.maPhieuKham] || [];
            acc[x.maPhieuKham].push(x);
            return acc;
          }, {});
          const mapHD = hdList.reduce((acc, x) => {
            acc[x.maPhieuKham] = acc[x.maPhieuKham] || [];
            acc[x.maPhieuKham].push(x);
            return acc;
          }, {});
  
          // Gắn vào object trả về
          const result = phieus.map(p => ({
            ...p,
            chiTiet: mapCT[p.maPhieuKham] || [],
            hoaDons: mapHD[p.maPhieuKham] || []
          }));
          res.json(result);
        });
      });
    });
  };
  
  // GET detail 1 phiếu (kèm chi tiết + hoá đơn)
  exports.getById = (req, res) => {
    const { id } = req.params;
    const sqlMain = `
      SELECT 
        PK.*,
        LK.ngayDatLich, LK.trieuChung, LK.trangThai AS trangThaiLich,
        BN.hoTen AS benhNhanHoTen,
        TK.tenTaiKhoan AS nguoiDatTK,
        CK.ngayKham, CK.gioBatDau, CK.gioKetThuc
      FROM PHIEUKHAM PK
      JOIN LICHKHAM LK ON PK.maLichKham = LK.maLichKham
      JOIN NGUOIDUNG BN ON LK.maBenhNhan   = BN.maNguoiDung
      JOIN TAIKHOAN TK ON LK.maNguoiDat    = TK.tenTaiKhoan
      JOIN CAKHAM CK ON LK.maCaKham        = CK.maCaKham
      WHERE PK.maPhieuKham = ?
    `;
    db.query(sqlMain, [id], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      if (rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy phiếu khám' });
      const phieu = rows[0];
  
      // Lấy chi tiết dịch vụ
      const sqlCT = `
        SELECT CTPK.*, DV.tenDichVu, DV.donGia
        FROM CHITIETPHIEUKHAM CTPK
        JOIN DICHVU DV ON CTPK.maDichVu = DV.maDichVu
        WHERE CTPK.maPhieuKham = ?
      `;
      db.query(sqlCT, [id], (err2, ctList) => {
        if (err2) return res.status(500).json({ error: err2.message });
  
        // Lấy hoá đơn
        const sqlHD = `SELECT * FROM HOADON WHERE maPhieuKham = ?`;
        db.query(sqlHD, [id], (err3, hdList) => {
          if (err3) return res.status(500).json({ error: err3.message });
  
          phieu.chiTiet = ctList;
          phieu.hoaDons = hdList;
          res.json(phieu);
        });
      });
    });
  };

// POST tạo Phiếu Khám
exports.create = (req, res) => {
  const { ketQuaChuanDoan, ngayTaiKham, maLichKham } = req.body;
  db.query(
    `INSERT INTO PHIEUKHAM (ketQuaChuanDoan, ngayTaiKham, maLichKham) VALUES (?, ?, ?)`,
    [ketQuaChuanDoan, ngayTaiKham, maLichKham],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Tạo phiếu khám thành công', maPhieuKham: result.insertId });
    }
  );
};

// PUT cập nhật Phiếu Khám
exports.update = (req, res) => {
  const { id } = req.params;
  const { ketQuaChuanDoan, ngayTaiKham, maLichKham } = req.body;
  db.query(
    `UPDATE PHIEUKHAM SET ketQuaChuanDoan = ?, ngayTaiKham = ?, maLichKham = ? WHERE maPhieuKham = ?`,
    [ketQuaChuanDoan, ngayTaiKham, maLichKham, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy phiếu' });
      res.json({ message: 'Cập nhật phiếu khám thành công' });
    }
  );
};

// DELETE Phiếu Khám
exports.delete = (req, res) => {
  const { id } = req.params;
  db.query(`DELETE FROM PHIEUKHAM WHERE maPhieuKham = ?`, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy phiếu' });
    res.json({ message: 'Xóa phiếu khám thành công' });
  });
};
