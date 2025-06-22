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

  // Kiểm tra xem phiếu khám này đã có hóa đơn hợp lệ chưa
  if (maPhieuKham) {
    db.query(
      'SELECT * FROM HOADON WHERE maPhieuKham = ? AND soTien > 0',
      [maPhieuKham],
      (err, existingInvoices) => {
        if (err) return res.status(500).json({ error: err.message });

        if (existingInvoices.length > 0) {
          return res.status(400).json({
            error: 'Phiếu khám này đã có hóa đơn. Không thể tạo hóa đơn trùng lặp.',
            existingInvoice: existingInvoices[0]
          });
        }

        // Nếu chưa có hóa đơn hợp lệ, tiến hành tạo mới
        createInvoice();
      }
    );
  } else {
    // Nếu không có maPhieuKham, tạo trực tiếp
    createInvoice();
  }

  function createInvoice() {
    db.query(
      `INSERT INTO HOADON (soTien, phuongThuc, trangThai, ngaytao, ngayThanhToan, maPhieuKham)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [soTien, phuongThuc, trangThai, ngaytao, ngayThanhToan, maPhieuKham],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Tạo hoá đơn thành công', maHoaDon: result.insertId });
      }
    );
  }
};

// CREATE hoá đơn kèm chi tiết dịch vụ (cho bác sĩ)
exports.createWithDetails = (req, res) => {
  const { soTien, phuongThuc, trangThai, ngaytao, ngayThanhToan, maPhieuKham, services } = req.body;

  // Kiểm tra xem phiếu khám này đã có hóa đơn hợp lệ chưa
  if (maPhieuKham) {
    db.query(
      'SELECT * FROM HOADON WHERE maPhieuKham = ? AND soTien > 0',
      [maPhieuKham],
      (err, existingInvoices) => {
        if (err) return res.status(500).json({ error: err.message });

        if (existingInvoices.length > 0) {
          return res.status(400).json({
            error: 'Phiếu khám này đã có hóa đơn. Không thể tạo hóa đơn trùng lặp.',
            existingInvoice: existingInvoices[0]
          });
        }

        // Nếu chưa có hóa đơn hợp lệ, tiến hành tạo mới với transaction
        createInvoiceWithDetails();
      }
    );
  } else {
    createInvoiceWithDetails();
  }

  function createInvoiceWithDetails() {
    // Bắt đầu transaction
    db.beginTransaction((err) => {
      if (err) return res.status(500).json({ error: err.message });

      // 1. Tạo hóa đơn
      db.query(
        `INSERT INTO HOADON (soTien, phuongThuc, trangThai, ngaytao, ngayThanhToan, maPhieuKham)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [soTien, phuongThuc, trangThai, ngaytao, ngayThanhToan, maPhieuKham],
        (err, result) => {
          if (err) {
            return db.rollback(() => {
              res.status(500).json({ error: err.message });
            });
          }

          const maHoaDon = result.insertId;

          // 2. Xóa chi tiết dịch vụ cũ (nếu có)
          db.query(
            'DELETE FROM CHITIETPHIEUKHAM WHERE maPhieuKham = ?',
            [maPhieuKham],
            (err) => {
              if (err) {
                return db.rollback(() => {
                  res.status(500).json({ error: err.message });
                });
              }

              // 3. Thêm chi tiết dịch vụ mới
              if (services && services.length > 0) {
                const values = services.map(service => [
                  maPhieuKham,
                  service.maDichVu,
                  service.soLuong,
                  service.ghiChu || ''
                ]);

                db.query(
                  'INSERT INTO CHITIETPHIEUKHAM (maPhieuKham, maDichVu, soLuong, ghiChu) VALUES ?',
                  [values],
                  (err) => {
                    if (err) {
                      return db.rollback(() => {
                        res.status(500).json({ error: err.message });
                      });
                    }

                    // Commit transaction
                    db.commit((err) => {
                      if (err) {
                        return db.rollback(() => {
                          res.status(500).json({ error: err.message });
                        });
                      }

                      res.status(201).json({
                        message: 'Tạo hoá đơn và chi tiết dịch vụ thành công',
                        maHoaDon: maHoaDon
                      });
                    });
                  }
                );
              } else {
                // Không có dịch vụ, chỉ commit hóa đơn
                db.commit((err) => {
                  if (err) {
                    return db.rollback(() => {
                      res.status(500).json({ error: err.message });
                    });
                  }

                  res.status(201).json({
                    message: 'Tạo hoá đơn thành công',
                    maHoaDon: maHoaDon
                  });
                });
              }
            }
          );
        }
      );
    });
  }
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

// GET chi tiết hoá đơn kèm dịch vụ
exports.getDetailWithServices = (req, res) => {
  const { id } = req.params;

  // Lấy thông tin hóa đơn và phiếu khám
  const query = `
    SELECT 
      hd.*,
      pk.ketQuaChuanDoan,
      pk.ngayTaiKham,
      pk.maLichKham,
      lk.ngayDatLich,
      lk.trieuChung,
      lk.trangThaiLich,
      lk.ngayKham,
      lk.gioBatDau,
      lk.gioKetThuc,
      lk.benhNhanHoTen,
      lk.nguoiDatTK,
      lk.soDienThoai
    FROM HOADON hd
    LEFT JOIN PHIEUKHAM pk ON hd.maPhieuKham = pk.maPhieuKham
    LEFT JOIN LICHKHAM lk ON pk.maLichKham = lk.maLichKham
    WHERE hd.maHoaDon = ?
  `;

  db.query(query, [id], (err, invoiceRows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (invoiceRows.length === 0) return res.status(404).json({ message: 'Không tìm thấy hoá đơn' });

    const invoice = invoiceRows[0];

    // Lấy chi tiết dịch vụ
    const serviceQuery = `
      SELECT 
        ct.maDichVu,
        ct.soLuong,
        ct.ghiChu,
        dv.tenDichVu,
        dv.donGia,
        (ct.soLuong * dv.donGia) as thanhTien
      FROM CHITIETPHIEUKHAM ct
      JOIN DICHVU dv ON ct.maDichVu = dv.maDichVu
      WHERE ct.maPhieuKham = ?
    `;

    db.query(serviceQuery, [invoice.maPhieuKham], (err, serviceRows) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({
        ...invoice,
        tenBenhNhan: invoice.benhNhanHoTen,
        chiTiet: serviceRows
      });
    });
  });
};

// DELETE hoá đơn
exports.delete = (req, res) => {
  db.query('DELETE FROM HOADON WHERE maHoaDon = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy hoá đơn' });
    res.json({ message: 'Xóa thành công' });
  });
};

// Lấy hóa đơn theo bệnh nhân và bác sĩ
exports.getByPatientAndDoctor = (req, res) => {
  const { maBenhNhan, maNhaSi } = req.params;

  const sql = `
    SELECT 
      HD.*,
      PK.ketQuaChuanDoan,
      LK.trieuChung,
      LK.ngayDatLich,
      CK.ngayKham
    FROM HOADON HD
    INNER JOIN PHIEUKHAM PK ON HD.maPhieuKham = PK.maPhieuKham
    INNER JOIN LICHKHAM LK ON PK.maLichKham = LK.maLichKham
    INNER JOIN CAKHAM CK ON LK.maCaKham = CK.maCaKham
    WHERE LK.maBenhNhan = ? 
      AND CK.maNhaSi = ?
      AND HD.soTien > 0
    ORDER BY HD.ngaytao DESC
  `;

  db.query(sql, [maBenhNhan, maNhaSi], (err, rows) => {
    if (err) {
      console.error('Error getting invoices by patient and doctor:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
};

// Lấy chi tiết hóa đơn kèm dịch vụ
exports.getDetailWithServices = (req, res) => {
  const { id } = req.params;

  // Lấy thông tin hóa đơn cơ bản
  const sqlHoaDon = `
    SELECT 
      HD.*,
      PK.ketQuaChuanDoan,
      LK.trieuChung, LK.ngayDatLich, LK.maBenhNhan,
      BN.hoTen AS tenBenhNhan, BN.soDienThoai,
      CK.ngayKham
    FROM HOADON HD
    INNER JOIN PHIEUKHAM PK ON HD.maPhieuKham = PK.maPhieuKham
    INNER JOIN LICHKHAM LK ON PK.maLichKham = LK.maLichKham
    INNER JOIN NGUOIDUNG BN ON LK.maBenhNhan = BN.maNguoiDung
    INNER JOIN CAKHAM CK ON LK.maCaKham = CK.maCaKham
    WHERE HD.maHoaDon = ?
  `;

  db.query(sqlHoaDon, [id], (err, hoaDonRows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (hoaDonRows.length === 0) return res.status(404).json({ message: 'Không tìm thấy hoá đơn' });

    const hoaDon = hoaDonRows[0];

    // Lấy chi tiết dịch vụ
    const sqlChiTiet = `
      SELECT 
        CTPK.maDichVu, CTPK.soLuong, CTPK.ghiChu,
        DV.tenDichVu, DV.donGia,
        (CTPK.soLuong * DV.donGia) AS thanhTien
      FROM CHITIETPHIEUKHAM CTPK
      INNER JOIN DICHVU DV ON CTPK.maDichVu = DV.maDichVu
      WHERE CTPK.maPhieuKham = ?
    `;

    db.query(sqlChiTiet, [hoaDon.maPhieuKham], (err, chiTietRows) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json({
        ...hoaDon,
        chiTiet: chiTietRows
      });
    });
  });
};
