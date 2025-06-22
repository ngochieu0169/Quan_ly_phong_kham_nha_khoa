// controllers/nhaSiController.js
const db = require('../configs/database');

// Lấy danh sách nha sĩ (có thể filter theo phòng khám)
exports.getAll = (req, res) => {
  const { maPhongKham } = req.query;

  console.log('=== DEBUG nhaSi getAll ===');
  console.log('Query params:', req.query);
  console.log('maPhongKham:', maPhongKham);

  let sql = `SELECT * FROM NHASI`;
  const params = [];

  if (maPhongKham) {
    sql += ` WHERE maPhongKham = ?`;
    params.push(maPhongKham);
  }

  console.log('SQL query:', sql);
  console.log('Params:', params);

  db.query(sql, params, (err, results) => {
    if (err) {
      console.log('DB Error:', err);
      return res.status(500).json({ error: err.message });
    }
    console.log('Results count:', results.length);
    res.json(results);
  });
};

// Lấy thông tin 1 nha sĩ theo mã
exports.getById = (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM NHASI WHERE maNhaSi = ?`;
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(404).json({ message: 'Không tìm thấy nha sĩ' });
    res.json(results[0]);
  });
};

// Thêm nha sĩ mới
exports.create = (req, res) => {
  const { maNhaSi, maPhongKham, hoTen, kinhNghiem, chucVu, ghiChu } = req.body;
  const sql = `
    INSERT INTO NHASI (maNhaSi, maPhongKham, hoTen, kinhNghiem, chucVu, ghiChu)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.query(
    sql,
    [maNhaSi, maPhongKham, hoTen, kinhNghiem, chucVu, ghiChu],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Thêm nha sĩ thành công' });
    }
  );
};

// Cập nhật nha sĩ
exports.update = (req, res) => {
  const { id } = req.params;
  const { maPhongKham, hoTen, kinhNghiem, chucVu, ghiChu } = req.body;
  const sql = `
    UPDATE NHASI
    SET maPhongKham = ?, hoTen = ?, kinhNghiem = ?, chucVu = ?, ghiChu = ?
    WHERE maNhaSi = ?
  `;
  db.query(
    sql,
    [maPhongKham, hoTen, kinhNghiem, chucVu, ghiChu, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0)
        return res.status(404).json({ message: 'Không tìm thấy nha sĩ' });
      res.json({ message: 'Cập nhật nha sĩ thành công' });
    }
  );
};

// Xóa nha sĩ
exports.delete = (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM NHASI WHERE maNhaSi = ?`;
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Không tìm thấy nha sĩ' });
    res.json({ message: 'Xóa nha sĩ thành công' });
  });
};

// Lấy danh sách nha sĩ theo phòng khám (với thông tin user)
exports.getByClinic = (req, res) => {
  const { clinicId } = req.params;
  const sql = `
    SELECT 
      NS.*,
      ND.ngaySinh,
      ND.gioiTinh,
      ND.eMail,
      ND.soDienThoai,
      ND.diaChi,
      ND.anh
    FROM NHASI NS
    JOIN TAIKHOAN TK ON NS.maNhaSi = TK.tenTaiKhoan
    JOIN NGUOIDUNG ND ON TK.maNguoiDung = ND.maNguoiDung
    WHERE NS.maPhongKham = ?
  `;

  db.query(sql, [clinicId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    // Format the results to include userData
    const formattedResults = results.map(doctor => ({
      maNhaSi: doctor.maNhaSi,
      maPhongKham: doctor.maPhongKham,
      hoTen: doctor.hoTen,
      kinhNghiem: doctor.kinhNghiem,
      chucVu: doctor.chucVu,
      ghiChu: doctor.ghiChu,
      userData: {
        ngaySinh: doctor.ngaySinh,
        gioiTinh: doctor.gioiTinh,
        eMail: doctor.eMail,
        soDienThoai: doctor.soDienThoai,
        diaChi: doctor.diaChi,
        anh: doctor.anh
      }
    }));

    res.json(formattedResults);
  });
};
