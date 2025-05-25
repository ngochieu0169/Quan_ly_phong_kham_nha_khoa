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
      -- Thông tin lịch khám nếu đã có booking
      LK.maLichKham,
      LK.trangThai AS trangThaiLich,
      LK.maBenhNhan,
      LK.trieuChung
    FROM CAKHAM CK
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

  // Chuyển đổi định dạng từ "DD-MM-YYYY" → "YYYY-MM-DD"
  const [day, month, year] = ngayKham.split("-");
  const formattedNgayKham = `${year}-${month}-${day}`;

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
  const { trangThai } = req.body;

  const sql = "UPDATE CAKHAM SET trangThai = ? WHERE maCaKham = ?";
  db.query(sql, [trangThai, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
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
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({ error: "Thiếu tham số ngày (date=YYYY-MM-DD)" });
  }

  // 1. Các ca mặc định
  const defaultSlots = [
    { start: "08:00:00", end: "10:00:00" },
    { start: "10:00:00", end: "12:00:00" },
    { start: "13:00:00", end: "15:00:00" },
    { start: "15:00:00", end: "17:00:00" },
  ];

  // 2. Lấy ca bác sĩ đã đăng ký CAKHAM cho ngày đó, kèm tên bác sĩ
  const sqlCakham = `
    SELECT c.maCaKham, c.gioBatDau, c.gioKetThuc, n.hoTen AS doctorName
    FROM CAKHAM c
    JOIN NHASI n ON c.maNhaSi = n.maNhaSi
    WHERE c.ngayKham = ?
  `;

  // 3. Lấy các ca đã được bệnh nhân đặt (tham chiếu bảng LICH_HEN)
  //    Giả sử bảng LICH_HEN có cột maCaKham
  const sqlBooked = `
    SELECT DISTINCT maCaKham
    FROM LICHKHAM
  `;

  // Chạy 2 query song song
  db.query(sqlCakham, [date], (err, cakhams) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Lỗi khi đọc CAKHAM" });
    }

    db.query(sqlBooked, (err2, bookedRows) => {
      if (err2) {
        console.error(err2);
        return res.status(500).json({ error: "Lỗi khi đọc LICH_HEN" });
      }

      const bookedSet = new Set(bookedRows.map(r => r.maCaKham));

      // Ghép doctorName vào các ca bác sĩ đã đăng ký
      // và loại bỏ những ca đã booked
      const slotMap = new Map(); // key = start+'-'+end
      cakhams.forEach(slot => {
        if (!bookedSet.has(slot.maCaKham)) {
          slotMap.set(
            `${slot.gioBatDau}-${slot.gioKetThuc}`,
            slot.doctorName
          );
        }
      });

      // 4. Tạo kết quả: duyệt defaultSlots
      const result = defaultSlots
        .map(s => {
          const key = `${s.start}-${s.end}`;
          const doctorName = slotMap.get(key);
          return {
            start: s.start.slice(0,5),
            end: s.end.slice(0,5),
            ...(doctorName && { doctorName })
          };
        })
        // 5. Loại slot nào bác sĩ đã đăng ký nhưng sau đó bị book?
        //    (đã loại ở bước slotMap), và default slot luôn xuất hiện—
        //    nếu bạn muốn chỉ show khi bác sĩ đã mở slot, hãy .filter(d => slotMap.has(...))
        //    Còn nếu muốn show tất cả default và chỉ ẩn booking, giữ nguyên.
        ;

      return res.json(result);
    });
  });
}
