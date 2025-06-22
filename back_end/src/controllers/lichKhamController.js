const db = require('../configs/database');

// GET danh sách Lịch Khám kèm info con
exports.getAll = (req, res) => {
  const sql = `
    SELECT 
      LK.*,
      BN.hoTen AS benhNhanHoTen,
      TK.maQuyen, TK.tenTaiKhoan AS nguoiDatTK, 
      CK.ngayKham, CK.gioBatDau, CK.gioKetThuc, CK.moTa AS caKhamMoTa,
      NS.hoTen AS tenNhaSi,
      NS.maNhaSi
    FROM LICHKHAM LK
    JOIN NGUOIDUNG BN ON LK.maBenhNhan = BN.maNguoiDung
    JOIN TAIKHOAN   TK ON LK.maNguoiDat = TK.tenTaiKhoan
    JOIN CAKHAM     CK ON LK.maCaKham   = CK.maCaKham
    LEFT JOIN NHASI NS ON CK.maNhaSi    = NS.maNhaSi
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
        const map = phieus.reduce((a, p) => {
          a[p.maLichKham] = a[p.maLichKham] || [];
          a[p.maLichKham].push(p);
          return a;
        }, {});
        // gắn vào
        const result = lichs.map(lk => ({
          ...lk,
          phieuKhams: map[lk.maLichKham] || []
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
      CK.ngayKham, CK.gioBatDau, CK.gioKetThuc, CK.moTa AS caKhamMoTa,
      NS.hoTen AS tenNhaSi,
      NS.maNhaSi
    FROM LICHKHAM LK
    JOIN NGUOIDUNG BN ON LK.maBenhNhan = BN.maNguoiDung
    JOIN TAIKHOAN   TK ON LK.maNguoiDat = TK.tenTaiKhoan
    JOIN CAKHAM     CK ON LK.maCaKham   = CK.maCaKham
    LEFT JOIN NHASI NS ON CK.maNhaSi    = NS.maNhaSi
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

  console.log('=== DEBUG lichKham create ===');
  console.log('Request body:', req.body);
  console.log('ngayDatLich:', ngayDatLich, 'type:', typeof ngayDatLich);

  // Validate that the appointment date matches the shift's examination date
  const validateShiftDate = `
    SELECT ngayKham FROM CAKHAM WHERE maCaKham = ?
  `;

  db.query(validateShiftDate, [maCaKham], (err, shiftRows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (shiftRows.length === 0) {
      return res.status(400).json({ message: 'Ca khám không tồn tại' });
    }

    // Validate ngayDatLich format
    if (!ngayDatLich) {
      return res.status(400).json({ message: 'Ngày đặt lịch không được để trống' });
    }

    // Try to parse the date and handle invalid dates
    let appointmentDate;
    try {
      const dateObj = new Date(ngayDatLich);
      if (isNaN(dateObj.getTime())) {
        throw new Error('Invalid date');
      }
      appointmentDate = dateObj.toISOString().split('T')[0];
    } catch (error) {
      return res.status(400).json({
        message: 'Định dạng ngày đặt lịch không hợp lệ',
        receivedDate: ngayDatLich
      });
    }

    const shiftDate = new Date(shiftRows[0].ngayKham).toISOString().split('T')[0];

    if (shiftDate !== appointmentDate) {
      return res.status(400).json({
        message: 'Ngày đặt lịch không khớp với ngày khám của ca được chọn',
        shiftDate: shiftDate,
        appointmentDate: appointmentDate
      });
    }

    // Format date for database (ensure YYYY-MM-DD format)
    const formattedNgayDatLich = new Date(ngayDatLich).toISOString().split('T')[0];

    const sql = `
      INSERT INTO LICHKHAM
        (ngayDatLich, trieuChung, trangThai, maBenhNhan, maNguoiDat, quanHeBenhNhanVaNguoiDat, maCaKham)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(
      sql,
      [formattedNgayDatLich, trieuChung, trangThai, maBenhNhan, maNguoiDat, quanHeBenhNhanVaNguoiDat, maCaKham],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Tạo lịch khám thành công', maLichKham: result.insertId });
      }
    );
  });
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


// Lấy lịch khám chưa có bác sĩ (ca khám có maNhaSi = null)
exports.getPendingDoctorAssignment = (req, res) => {
  const sql = `
    SELECT 
      LK.maLichKham,
      LK.ngayDatLich,
      LK.trieuChung,
      LK.trangThai,
      LK.maBenhNhan,
      LK.maNguoiDat,
      LK.quanHeBenhNhanVaNguoiDat,
      LK.maCaKham,
      -- Thông tin ca khám
      CK.ngayKham,
      CK.gioBatDau,
      CK.gioKetThuc,
      CK.moTa,
      CK.maNhaSi,
      -- Thông tin bệnh nhân
      ND.hoTen AS tenBenhNhan,
      ND.soDienThoai,
      ND.eMail,
      ND.gioiTinh,
      ND.ngaySinh
    FROM LICHKHAM LK
    INNER JOIN CAKHAM CK ON LK.maCaKham = CK.maCaKham
    INNER JOIN NGUOIDUNG ND ON LK.maBenhNhan = ND.maNguoiDung
    WHERE CK.maNhaSi IS NULL
      AND CK.ngayKham >= CURDATE()
      AND LK.trangThai IN ('Chờ', 'Đã đặt')
    ORDER BY CK.ngayKham ASC, CK.gioBatDau ASC
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error('Error getting pending doctor assignments:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
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

// Lấy lịch khám theo bác sĩ cụ thể
exports.getByDoctor = (req, res) => {
  const { maNhaSi } = req.params;
  const { startDate, endDate } = req.query;

  let sql = `
    SELECT 
      LK.maLichKham,
      LK.ngayDatLich,
      LK.trieuChung,
      LK.trangThai,
      LK.maBenhNhan,
      LK.maNguoiDat,
      LK.quanHeBenhNhanVaNguoiDat,
      LK.maCaKham,
      -- Thông tin ca khám
      CK.ngayKham,
      CK.gioBatDau,
      CK.gioKetThuc,
      CK.moTa,
      CK.maNhaSi,
      -- Thông tin bệnh nhân
      ND.hoTen AS tenBenhNhan,
      ND.soDienThoai,
      ND.eMail,
      ND.gioiTinh,
      ND.ngaySinh,
      ND.diaChi,
      ND.anh,
      -- Thông tin bác sĩ
      NS.hoTen AS tenNhaSi
    FROM LICHKHAM LK
    INNER JOIN CAKHAM CK ON LK.maCaKham = CK.maCaKham
    INNER JOIN NGUOIDUNG ND ON LK.maBenhNhan = ND.maNguoiDung
    INNER JOIN NHASI NS ON CK.maNhaSi = NS.maNhaSi
    WHERE CK.maNhaSi = ?
  `;

  const params = [maNhaSi];

  // Thêm filter theo ngày nếu có
  if (startDate && endDate) {
    sql += ` AND CK.ngayKham BETWEEN ? AND ?`;
    params.push(startDate, endDate);
  } else if (startDate) {
    sql += ` AND CK.ngayKham >= ?`;
    params.push(startDate);
  } else if (endDate) {
    sql += ` AND CK.ngayKham <= ?`;
    params.push(endDate);
  }

  sql += ` ORDER BY CK.ngayKham DESC, CK.gioBatDau ASC`;

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.error('Error getting appointments by doctor:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
};

// Lấy danh sách bệnh nhân đã khám của bác sĩ
exports.getPatientsByDoctor = (req, res) => {
  const { maNhaSi } = req.params;

  const sql = `
    SELECT 
      ND.maNguoiDung,
      ND.hoTen,
      ND.ngaySinh,
      ND.gioiTinh,
      ND.eMail,
      ND.soDienThoai,
      ND.diaChi,
      ND.anh,
      COUNT(LK.maLichKham) as soLanKham,
      MAX(CK.ngayKham) as lanKhamGanNhat
    FROM NGUOIDUNG ND
    INNER JOIN LICHKHAM LK ON ND.maNguoiDung = LK.maBenhNhan
    INNER JOIN CAKHAM CK ON LK.maCaKham = CK.maCaKham
    WHERE CK.maNhaSi = ?
    GROUP BY ND.maNguoiDung, ND.hoTen, ND.ngaySinh, ND.gioiTinh, ND.eMail, ND.soDienThoai, ND.diaChi, ND.anh
    ORDER BY lanKhamGanNhat DESC
  `;

  db.query(sql, [maNhaSi], (err, rows) => {
    if (err) {
      console.error('Error getting patients by doctor:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
};
