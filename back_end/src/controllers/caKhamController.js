const db = require('../configs/database');

// GET /api/cakham?maNhaSi=...
exports.getAll = (req, res) => {
  const { maNhaSi } = req.query;

  // Lấy ca khám 7 ngày tới
  let sql = `
    SELECT 
      CK.maCaKham,
      CK.ngayKham,
      CK.gioBatDau,
      CK.gioKetThuc,
      CK.moTa,
      CK.maNhaSi,
      NS.hoTen AS tenNhaSi,
      -- Thông tin lịch khám nếu đã có booking
      LK.maLichKham,
      LK.trangThai AS trangThaiLich,
      LK.maBenhNhan,
      LK.trieuChung
    FROM CAKHAM CK
    LEFT JOIN NHASI NS ON CK.maNhaSi = NS.maNhaSi
    LEFT JOIN LICHKHAM LK
      ON CK.maCaKham = LK.maCaKham
    WHERE CK.ngayKham BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
  `;
  const params = [];

  // if (maNhaSi) {
  //   sql += ` AND CK.maNhaSi = ?`;
  //   params.push(maNhaSi);
  // }

  db.query(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    // Trả về mảng mỗi phần tử có ca + lịch (hoặc null)
    res.json(rows);
  });
};


// Lấy ca khám theo ID
exports.getById = (req, res) => {
  db.query('SELECT * FROM CAKHAM WHERE maCaKham = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ message: 'Không tìm thấy ca khám' });
    res.json(result[0]);
  });
};

// Tạo ca khám mới
exports.create = (req, res) => {
  let { ngayKham, gioBatDau, gioKetThuc, moTa, maNhaSi } = req.body;

  // Nếu không có maNhaSi, gán null
  if (!maNhaSi) {
    maNhaSi = null;
  }

  // Kiểm tra format ngày khám - nếu đã là YYYY-MM-DD thì giữ nguyên
  let formattedNgayKham = ngayKham;
  if (ngayKham.includes("-")) {
    const parts = ngayKham.split("-");
    if (parts[0].length === 2) {
      // Format DD-MM-YYYY, chuyển thành YYYY-MM-DD
      const [day, month, year] = parts;
      formattedNgayKham = `${year}-${month}-${day}`;
    }
    // Nếu parts[0].length === 4 thì đã là YYYY-MM-DD, giữ nguyên
  }

  const sql = `INSERT INTO CAKHAM (ngayKham, gioBatDau, gioKetThuc, moTa, maNhaSi) 
               VALUES (?, ?, ?, ?, ?)`;
  db.query(sql, [formattedNgayKham, gioBatDau, gioKetThuc, moTa, maNhaSi], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Thêm ca khám thành công', data: result });
  });
};


// PUT /api/cakham/:id
exports.update = (req, res) => {
  const { id } = req.params;
  const { trangThai, maNhaSi } = req.body;

  let sql = "UPDATE CAKHAM SET ";
  const params = [];
  const updates = [];

  if (trangThai !== undefined) {
    updates.push("trangThai = ?");
    params.push(trangThai);
  }

  if (maNhaSi !== undefined) {
    updates.push("maNhaSi = ?");
    params.push(maNhaSi);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: "Không có dữ liệu để cập nhật" });
  }

  sql += updates.join(", ") + " WHERE maCaKham = ?";
  params.push(id);

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Không tìm thấy ca khám" });
    }
    res.json({ message: "Cập nhật thành công" });
  });
};

// Xóa ca khám
exports.delete = (req, res) => {
  db.query('DELETE FROM CAKHAM WHERE maCaKham = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy ca khám' });
    res.json({ message: 'Xóa ca khám thành công' });
  });
};


exports.lichTrong = (req, res) => {
  const { date, maPhongKham } = req.query;
  if (!date) {
    return res.status(400).json({ error: "Thiếu tham số ngày (date=YYYY-MM-DD)" });
  }

  // Các ca mặc định - LUÔN hiển thị tất cả khi không chọn bác sĩ
  const defaultSlots = [
    { start: "08:00:00", end: "09:00:00" },
    { start: "09:00:00", end: "10:00:00" },
    { start: "10:00:00", end: "11:00:00" },
    { start: "13:00:00", end: "14:00:00" },
    { start: "14:00:00", end: "15:00:00" },
    { start: "15:00:00", end: "16:00:00" },
    { start: "16:00:00", end: "17:00:00" },
  ];

  // Trả về tất cả ca mặc định, không cần kiểm tra đã đặt hay chưa
  // Lễ tân sẽ tự xử lý việc phân công
  const result = defaultSlots.map((slot, index) => ({
    id: `default_${index}`,
    start: slot.start.slice(0, 5),
    end: slot.end.slice(0, 5),
  }));

  return res.json(result);
};

// Lấy ca khám của bác sĩ theo ngày
exports.getBacSiSchedule = (req, res) => {
  const { date, maNhaSi, maPhongKham } = req.query;

  if (!date || !maNhaSi || !maPhongKham) {
    return res.status(400).json({
      error: "Thiếu tham số bắt buộc (date, maNhaSi, maPhongKham)"
    });
  }

  // Lấy ca khám của bác sĩ trong ngày đó chưa được đặt
  const sql = `
    SELECT 
      c.maCaKham as id,
      c.gioBatDau as start,
      c.gioKetThuc as end,
      n.hoTen as doctorName,
      c.moTa
    FROM CAKHAM c
    JOIN NHASI n ON c.maNhaSi = n.maNhaSi
    JOIN PHONGKHAM pk ON n.maPhongKham = pk.maPhongKham
    LEFT JOIN LICHKHAM lk ON c.maCaKham = lk.maCaKham
    WHERE c.ngayKham = ? 
      AND c.maNhaSi = ?
      AND pk.maPhongKham = ?
      AND lk.maCaKham IS NULL
  `;

  db.query(sql, [date, maNhaSi, maPhongKham], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Lỗi khi lấy lịch bác sĩ" });
    }

    // Format lại thời gian từ HH:MM:SS về HH:MM
    const result = rows.map(slot => ({
      ...slot,
      start: slot.start.slice(0, 5),
      end: slot.end.slice(0, 5)
    }));

    res.json(result);
  });
};

// Lấy ca khám theo ngày cụ thể
exports.getByDate = (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: "Thiếu tham số ngày (date=YYYY-MM-DD)" });
  }

  const sql = `
    SELECT 
      CK.maCaKham,
      CK.ngayKham,
      CK.gioBatDau,
      CK.gioKetThuc,
      CK.moTa,
      CK.maNhaSi,
      -- Thông tin lịch khám nếu đã có booking
      LK.maLichKham,
      LK.trangThai AS trangThaiLich,
      LK.maBenhNhan,
      LK.trieuChung,
      -- Thông tin bác sĩ
      NS.hoTen AS tenNhaSi
    FROM CAKHAM CK
    LEFT JOIN LICHKHAM LK ON CK.maCaKham = LK.maCaKham
    LEFT JOIN NHASI NS ON CK.maNhaSi = NS.maNhaSi
    WHERE DATE(CK.ngayKham) = ?
    ORDER BY CK.gioBatDau ASC
  `;

  db.query(sql, [date], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

// Lấy ca khám chưa được phân công bác sĩ (maNhaSi = null) kèm thông tin bệnh nhân
exports.getPendingAssignments = (req, res) => {
  const sql = `
    SELECT 
      CK.maCaKham,
      CK.ngayKham,
      CK.gioBatDau,
      CK.gioKetThuc,
      CK.moTa,
      CK.maNhaSi,
      -- Thông tin lịch khám
      LK.maLichKham,
      LK.trangThai AS trangThaiLich,
      LK.maBenhNhan,
      LK.trieuChung,
      LK.ngayDatLich,
      -- Thông tin bệnh nhân
      ND.hoTen AS tenBenhNhan,
      ND.soDienThoai,
      ND.eMail
    FROM CAKHAM CK
    INNER JOIN LICHKHAM LK ON CK.maCaKham = LK.maCaKham
    INNER JOIN NGUOIDUNG ND ON LK.maBenhNhan = ND.maNguoiDung
    WHERE CK.maNhaSi IS NULL
      AND CK.ngayKham >= CURDATE()
    ORDER BY CK.ngayKham ASC, CK.gioBatDau ASC
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error('Error getting pending assignments:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
};

// Lấy ca khám theo bác sĩ cụ thể
exports.getByDoctor = (req, res) => {
  const { maNhaSi } = req.params;
  const { startDate, endDate } = req.query;

  let sql = `
    SELECT 
      CK.maCaKham,
      CK.ngayKham,
      CK.gioBatDau,
      CK.gioKetThuc,
      CK.moTa,
      CK.maNhaSi,
      -- Thông tin lịch khám (nếu có)
      LK.maLichKham,
      LK.trangThai AS trangThaiLich,
      LK.maBenhNhan,
      LK.trieuChung,
      LK.ngayDatLich,
      -- Thông tin bệnh nhân (nếu có)
      ND.hoTen AS tenBenhNhan,
      ND.soDienThoai,
      ND.eMail,
      -- Thông tin bác sĩ
      NS.hoTen AS tenNhaSi
    FROM CAKHAM CK
    LEFT JOIN LICHKHAM LK ON CK.maCaKham = LK.maCaKham
    LEFT JOIN NGUOIDUNG ND ON LK.maBenhNhan = ND.maNguoiDung
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

  sql += ` ORDER BY CK.ngayKham ASC, CK.gioBatDau ASC`;

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.error('Error getting shifts by doctor:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
};
