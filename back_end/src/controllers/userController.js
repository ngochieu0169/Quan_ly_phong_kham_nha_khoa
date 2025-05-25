// controllers/userController.js
const db = require('../configs/database');
const path = require('path');
const fs = require('fs');

exports.register = (req, res) => {
  const {
    tenTaiKhoan,
    matKhau,
    maQuyen,
    hoTen,
    ngaySinh,
    gioiTinh,
    eMail,
    soDienThoai,
    diaChi,
  } = req.body;

  const file = req.file;
  const anh = file ? file.filename : null;

  const sql1 = `
    INSERT INTO NGUOIDUNG (hoTen, ngaySinh, gioiTinh, eMail, soDienThoai, diaChi, anh)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql1,
    [hoTen, ngaySinh, gioiTinh, eMail, soDienThoai, diaChi, anh],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });

      const maNguoiDung = result.insertId;
      const sql2 = `
        INSERT INTO TAIKHOAN (tenTaiKhoan, matKhau, maQuyen, maNguoiDung)
        VALUES (?, ?, ?, ?)
      `;

      db.query(
        sql2,
        [tenTaiKhoan, matKhau, maQuyen, maNguoiDung],
        (err2) => {
          if (err2) return res.status(500).json({ error: err2 });
          res.json({ message: "Đăng ký tài khoản thành công" });
        }
      );
    }
  );
};
exports.loginUser = (req, res) => {
  const { tenTaiKhoan, matKhau } = req.body;

  const loginQuery = `
    SELECT 
      TK.tenTaiKhoan,
      TK.maQuyen,
      Q.tenQuyen,
      ND.maNguoiDung,
      ND.hoTen AS hoTenNguoiDung,
      ND.ngaySinh,
      ND.gioiTinh,
      ND.eMail,
      ND.soDienThoai,
      ND.diaChi,
      ND.anh
    FROM TAIKHOAN TK
    JOIN NGUOIDUNG ND ON TK.maNguoiDung = ND.maNguoiDung
    JOIN QUYEN Q ON TK.maQuyen = Q.maQuyen
    WHERE TK.tenTaiKhoan = ? AND TK.matKhau = ?
  `;

  db.query(loginQuery, [tenTaiKhoan, matKhau], (err, results) => {
    if (err) return res.status(500).json({ error: err });

    if (results.length === 0) {
      return res.status(401).json({ message: "Tài khoản hoặc mật khẩu không đúng" });
    }

    const user = results[0];

    // Nếu không phải nha sĩ
    if (user.maQuyen !== 2) {
      return res.json({
        message: "Đăng nhập thành công",
        user: {
          tenTaiKhoan: user.tenTaiKhoan,
          maQuyen: user.maQuyen,
          tenQuyen: user.tenQuyen,
          maNguoiDung: user.maNguoiDung,
          hoTen: user.hoTenNguoiDung,
          ngaySinh: user.ngaySinh,
          gioiTinh: user.gioiTinh,
          eMail: user.eMail,
          soDienThoai: user.soDienThoai,
          diaChi: user.diaChi,
          anh: user.anh
        }
      });
    }

    // Nếu là nha sĩ, truy vấn thêm thông tin từ bảng NHASI
    const nhaSiQuery = `
      SELECT 
        NS.maNhaSi,
        NS.maPhongKham,
        NS.hoTen AS hoTenNhaSi,
        NS.kinhNghiem,
        NS.chucVu,
        NS.ghiChu
      FROM NHASI NS
      WHERE NS.maNhaSi = ?
    `;

    db.query(nhaSiQuery, [tenTaiKhoan], (err2, nhaSiResults) => {
      if (err2) return res.status(500).json({ error: err2 });

      const nhaSi = nhaSiResults[0] || {};

      res.json({
        message: "Đăng nhập thành công",
        user: {
          tenTaiKhoan: user.tenTaiKhoan,
          maQuyen: user.maQuyen,
          tenQuyen: user.tenQuyen,
          maNguoiDung: user.maNguoiDung,
          hoTen: user.hoTenNguoiDung,
          ngaySinh: user.ngaySinh,
          gioiTinh: user.gioiTinh,
          eMail: user.eMail,
          soDienThoai: user.soDienThoai,
          diaChi: user.diaChi,
          anh: user.anh,
          nhaSi: nhaSi.maNhaSi ? {
            maNhaSi: nhaSi.maNhaSi,
            maPhongKham: nhaSi.maPhongKham,
            hoTen: nhaSi.hoTenNhaSi,
            kinhNghiem: nhaSi.kinhNghiem,
            chucVu: nhaSi.chucVu,
            ghiChu: nhaSi.ghiChu
          } : null
        }
      });
    });
  });
};


exports.updateNguoiDung = (req, res) => {
  const { hoTen, ngaySinh, gioiTinh, eMail, soDienThoai, diaChi } = req.body;
  const file = req.file;
  const anh = file ? file.filename : null;

  let sql = `
    UPDATE NGUOIDUNG
    SET hoTen = ?, ngaySinh = ?, gioiTinh = ?, eMail = ?, soDienThoai = ?, diaChi = ?
  `;

  const params = [hoTen, ngaySinh, gioiTinh, eMail, soDienThoai, diaChi];

  if (anh) {
    sql += `, anh = ?`;
    params.push(anh);
  }

  sql += ` WHERE maNguoiDung = ?`;
  params.push(req.params.maNguoiDung);

  db.query(sql, params, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Cập nhật thông tin người dùng thành công" });
  });
};


exports.deleteUser = (req, res) => {
  const maNguoiDung = req.params.id;

  db.query(`DELETE FROM TAIKHOAN WHERE maNguoiDung=?`, [maNguoiDung], (err1) => {
    if (err1) return res.status(500).json({ error: err1 });

    db.query(`DELETE FROM NGUOIDUNG WHERE maNguoiDung=?`, [maNguoiDung], (err2) => {
      if (err2) return res.status(500).json({ error: err2 });
      res.json({ message: 'Xóa người dùng thành công' });
    });
  });
};

// Đổi mật khẩu và quyền của tài khoản
exports.updateAccount = (req, res) => {
    const { tenTaiKhoan } = req.params;
    const { matKhau, maQuyen } = req.body;
  
    if (!matKhau || !maQuyen) {
      return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ thông tin' });
    }
  
    const query = `UPDATE TAIKHOAN SET matKhau = ?, maQuyen = ? WHERE tenTaiKhoan = ?`;
  
    db.query(query, [matKhau, maQuyen, tenTaiKhoan], (err, result) => {
      if (err) return res.status(500).json({ error: err });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Tài khoản không tồn tại' });
  
      res.json({ message: 'Cập nhật tài khoản thành công' });
    });
  };
  exports.getFullUserList = (req, res) => {
    const { maQuyen, maPhongKham } = req.query;
  
    const params = [];
    const whereClauses = [];
  
    if (maQuyen) {
      whereClauses.push('TK.maQuyen = ?');
      params.push(maQuyen);
    }
  
    const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
  
    const query = `
      SELECT 
        ND.maNguoiDung,
        ND.hoTen,
        ND.ngaySinh,
        ND.gioiTinh,
        ND.eMail,
        ND.soDienThoai,
        ND.diaChi,
        ND.anh,
  
        TK.tenTaiKhoan,
        TK.maQuyen,
        Q.tenQuyen,
  
        NS.maNhaSi,
        NS.hoTen AS hoTenNhaSi,
        NS.kinhNghiem,
        NS.chucVu,
        NS.ghiChu,
        NS.maPhongKham,
  
        PK.tenPhongKham,
        PK.diaChi AS diaChiPhongKham,
        PK.soDienThoai AS soDienThoaiPhongKham,
        PK.gioLamViec AS gioLamViecPhongKham,
        PK.trangthai AS trangThaiPhongKham
  
      FROM NGUOIDUNG ND
      JOIN TAIKHOAN TK ON ND.maNguoiDung = TK.maNguoiDung
      JOIN QUYEN Q ON TK.maQuyen = Q.maQuyen
      LEFT JOIN NHASI NS ON TK.maQuyen = 2 AND TK.tenTaiKhoan = NS.maNhaSi
      LEFT JOIN PHONGKHAM PK ON NS.maPhongKham = PK.maPhongKham
      ${whereSQL}
    `;
  
    db.query(query, params, (err, results) => {
      if (err) return res.status(500).json({ error: err });
  
      const mappedResults = results.map(row => {
        const {
          maNhaSi,
          hoTenNhaSi,
          kinhNghiem,
          chucVu,
          ghiChu,
          maPhongKham,
          tenPhongKham,
          diaChiPhongKham,
          soDienThoaiPhongKham,
          gioLamViecPhongKham,
          trangThaiPhongKham,
          ...userData
        } = row;
  
        const bacsiData = maNhaSi ? {
          maNhaSi,
          hoTen: hoTenNhaSi,
          kinhNghiem,
          chucVu,
          ghiChu,
          maPhongKham,
          phongKham: {
            tenPhongKham,
            diaChi: diaChiPhongKham,
            soDienThoai: soDienThoaiPhongKham,
            gioLamViec: gioLamViecPhongKham,
            trangThai: trangThaiPhongKham
          }
        } : null;
  
        return {
          ...userData,
          bacsiData
        };
      });
  
      // Filter sau khi map xong
      let filteredResults = mappedResults;
  
      if (maPhongKham) {
        filteredResults = mappedResults.filter(user =>
          user.bacsiData?.maPhongKham?.toString() === maPhongKham.toString()
        );
      }
  
      res.json(filteredResults);
    });
  };
  