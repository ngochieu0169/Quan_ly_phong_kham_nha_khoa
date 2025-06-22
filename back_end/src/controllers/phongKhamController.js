// controllers/phongKhamController.js
const db = require('../configs/database');

// Lấy tất cả phòng khám
exports.getAll = (req, res) => {
  const sql = `SELECT * FROM PHONGKHAM`;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Lấy 1 phòng khám theo ID
exports.getById = (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM PHONGKHAM WHERE maPhongKham = ?`;
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(404).json({ message: 'Không tìm thấy phòng khám' });
    res.json(results[0]);
  });
};

// Tạo mới phòng khám
exports.create = (req, res) => {
  const {
    tenPhongKham,
    diaChi,
    soDienThoai,
    gioLamViec,
    maChuPhongKham,
    // nếu không truyền trangthai, mặc định 'chưa duyệt'
    trangthai = 'chưa duyệt',
  } = req.body;

  const sql = `
    INSERT INTO PHONGKHAM
      (tenPhongKham, diaChi, soDienThoai, gioLamViec, maChuPhongKham, trangthai)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(
    sql,
    [tenPhongKham, diaChi, soDienThoai, gioLamViec, maChuPhongKham, trangthai],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({
        message: 'Tạo phòng khám thành công',
        maPhongKham: result.insertId,
      });
    }
  );
};

// Cập nhật phòng khám
exports.update = (req, res) => {
  const { id } = req.params;
  const fields = ['tenPhongKham', 'diaChi', 'soDienThoai', 'gioLamViec', 'maChuPhongKham', 'trangthai'];
  const sets = [];
  const values = [];

  fields.forEach(field => {
    if (req.body[field] !== undefined) {
      sets.push(`${field} = ?`);
      values.push(req.body[field]);
    }
  });

  if (sets.length === 0) {
    return res.status(400).json({ message: 'Không có trường nào để cập nhật' });
  }

  const sql = `
    UPDATE PHONGKHAM
    SET ${sets.join(', ')}
    WHERE maPhongKham = ?
  `;
  values.push(id);

  db.query(sql, values, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Không tìm thấy phòng khám' });
    res.json({ message: 'Cập nhật phòng khám thành công' });
  });
};
// Xóa phòng khám
exports.delete = (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM PHONGKHAM WHERE maPhongKham = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Không tìm thấy phòng khám' });
    res.json({ message: 'Xóa phòng khám thành công' });
  });
};

// Lấy phòng khám theo chủ phòng khám
exports.getByOwner = (req, res) => {
  const { ownerUsername } = req.params;
  const sql = `SELECT * FROM PHONGKHAM WHERE maChuPhongKham = ?`;
  db.query(sql, [ownerUsername], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Lấy thống kê doanh thu phòng khám
exports.getRevenue = (req, res) => {
  const { id } = req.params;
  const { startDate, endDate } = req.query;

  let sql = `
    SELECT 
      DATE_FORMAT(HD.ngayThanhToan, '%Y-%m') as month,
      SUM(HD.soTien) as totalRevenue,
      COUNT(HD.maHoaDon) as totalInvoices
    FROM HOADON HD
    JOIN PHIEUKHAM PK ON HD.maPhieuKham = PK.maPhieuKham
    JOIN LICHKHAM LK ON PK.maLichKham = LK.maLichKham
    JOIN CAKHAM CK ON LK.maCaKham = CK.maCaKham
    JOIN NHASI NS ON CK.maNhaSi = NS.maNhaSi
    WHERE NS.maPhongKham = ? AND HD.trangThai = 'Đã thu tiền'
  `;

  const params = [id];

  if (startDate && endDate) {
    sql += ` AND HD.ngayThanhToan BETWEEN ? AND ?`;
    params.push(startDate, endDate);
  }

  sql += ` GROUP BY DATE_FORMAT(HD.ngayThanhToan, '%Y-%m') ORDER BY month`;

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Lấy thống kê tổng quan phòng khám
exports.getStats = (req, res) => {
  const { id } = req.params;

  const queries = {
    thisMonth: `
      SELECT 
        COALESCE(SUM(HD.soTien), 0) as revenue,
        COUNT(HD.maHoaDon) as appointments
      FROM HOADON HD
      JOIN PHIEUKHAM PK ON HD.maPhieuKham = PK.maPhieuKham
      JOIN LICHKHAM LK ON PK.maLichKham = LK.maLichKham
      JOIN CAKHAM CK ON LK.maCaKham = CK.maCaKham
      JOIN NHASI NS ON CK.maNhaSi = NS.maNhaSi
      WHERE NS.maPhongKham = ? 
        AND HD.trangThai = 'Đã thu tiền'
        AND MONTH(HD.ngayThanhToan) = MONTH(CURRENT_DATE())
        AND YEAR(HD.ngayThanhToan) = YEAR(CURRENT_DATE())
    `,
    lastMonth: `
      SELECT 
        COALESCE(SUM(HD.soTien), 0) as revenue
      FROM HOADON HD
      JOIN PHIEUKHAM PK ON HD.maPhieuKham = PK.maPhieuKham
      JOIN LICHKHAM LK ON PK.maLichKham = LK.maLichKham
      JOIN CAKHAM CK ON LK.maCaKham = CK.maCaKham
      JOIN NHASI NS ON CK.maNhaSi = NS.maNhaSi
      WHERE NS.maPhongKham = ? 
        AND HD.trangThai = 'Đã thu tiền'
        AND MONTH(HD.ngayThanhToan) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH)
        AND YEAR(HD.ngayThanhToan) = YEAR(CURRENT_DATE() - INTERVAL 1 MONTH)
    `,
    thisYear: `
      SELECT 
        COALESCE(SUM(HD.soTien), 0) as revenue
      FROM HOADON HD
      JOIN PHIEUKHAM PK ON HD.maPhieuKham = PK.maPhieuKham
      JOIN LICHKHAM LK ON PK.maLichKham = LK.maLichKham
      JOIN CAKHAM CK ON LK.maCaKham = CK.maCaKham
      JOIN NHASI NS ON CK.maNhaSi = NS.maNhaSi
      WHERE NS.maPhongKham = ? 
        AND HD.trangThai = 'Đã thu tiền'
        AND YEAR(HD.ngayThanhToan) = YEAR(CURRENT_DATE())
    `
  };

  const results = {};
  let completed = 0;
  const total = Object.keys(queries).length;

  Object.keys(queries).forEach(key => {
    db.query(queries[key], [id], (err, result) => {
      if (err) {
        results[key] = { revenue: 0, appointments: 0 };
      } else {
        results[key] = result[0] || { revenue: 0, appointments: 0 };
      }

      completed++;
      if (completed === total) {
        res.json({
          thisMonth: results.thisMonth.revenue || 0,
          lastMonth: results.lastMonth.revenue || 0,
          thisYear: results.thisYear.revenue || 0,
          totalAppointments: results.thisMonth.appointments || 0,
          averagePerAppointment: results.thisMonth.appointments > 0 ?
            Math.round(results.thisMonth.revenue / results.thisMonth.appointments) : 0
        });
      }
    });
  });
};
