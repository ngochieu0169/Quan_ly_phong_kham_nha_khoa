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
      ND.hoTen,
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
    res.json({ 
      message: "Đăng nhập thành công",
      user: {
        tenTaiKhoan: user.tenTaiKhoan,
        maQuyen: user.maQuyen,
        tenQuyen: user.tenQuyen,
        maNguoiDung: user.maNguoiDung,
        hoTen: user.hoTen,
        ngaySinh: user.ngaySinh,
        gioiTinh: user.gioiTinh,
        eMail: user.eMail,
        soDienThoai: user.soDienThoai,
        diaChi: user.diaChi,
        anh: user.anh
      }
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
  

  // Lấy danh sách người dùng + tài khoản + quyền
exports.getFullUserList = (req, res) => {
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
      Q.tenQuyen
    FROM NGUOIDUNG ND
    JOIN TAIKHOAN TK ON ND.maNguoiDung = TK.maNguoiDung
    JOIN QUYEN Q ON TK.maQuyen = Q.maQuyen
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err });

    res.json(results);
  });
};
