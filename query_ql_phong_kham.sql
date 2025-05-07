create database PROJECT_PHONGKHAM

use PROJECT_PHONGKHAM;

drop datab-- ase PROJECT_PHONGKHAM


CREATE TABLE QUYEN (
    maQuyen INT PRIMARY KEY,
    tenQuyen NVARCHAR(50)
);

CREATE TABLE TAIKHOAN (
    maTaiKhoan INT PRIMARY KEY,
    tenTaiKhoan VARCHAR(50),
    matKhau VARCHAR(50),
    hoTen NVARCHAR(50),
    ngaySinh DATE,
    gioiTinh VARCHAR(10),
    eMail VARCHAR(50),
    soDienThoai VARCHAR(10),
    diaChi NVARCHAR(200),
    anh NVARCHAR(200),
    maQuyen INT,
    FOREIGN KEY (maQuyen) REFERENCES QUYEN(maQuyen)
);

CREATE TABLE PHONGKHAM (
    maPhongKham INT PRIMARY KEY,
    tenPhongKham NVARCHAR(50),
    diaChi NVARCHAR(200),
    soDienThoai VARCHAR(10),
    gioLamViec VARCHAR(50),
    maChuPhongKham INT,
    trangthai NVARCHAR(20), -- duyệt hoặc chưa duyệt, uy tín, VIP...
    FOREIGN KEY (maChuPhongKham) REFERENCES TAIKHOAN(maTaiKhoan)
);

CREATE TABLE NHASI (
    maNhaSi INT,
    maTaiKhoan INT,
    maPhongKham INT,
    hoTen NVARCHAR(200),
    kinhNghiem NVARCHAR(50),
    chucVu NVARCHAR(50),
    ghiChu NVARCHAR(255),
    PRIMARY KEY (maNhaSi),
    FOREIGN KEY (maPhongKham) REFERENCES PHONGKHAM(maPhongKham),
	FOREIGN KEY (maTaiKhoan) REFERENCES TAIKHOAN(maTaiKhoan)

    
);

CREATE TABLE DANHGIA (
    maDanhGia INT PRIMARY KEY,
    maPhongKham INT,
    maBenhNhan INT,
    danhGia INT,
    binhLuan NVARCHAR(255),
    NgayDanhGia DATE,
    FOREIGN KEY (maPhongKham) REFERENCES PHONGKHAM(maPhongKham),
    FOREIGN KEY (maBenhNhan) REFERENCES TAIKHOAN(maTaiKhoan)
);


CREATE TABLE LOAIDICHVU (
    maLoaiDichVu INT PRIMARY KEY,
    tenLoaiDichVu NVARCHAR(200)
);

CREATE TABLE DICHVU (
    maDichVu INT PRIMARY KEY,
    tenDichVu NVARCHAR(200),
    moTa NVARCHAR(255),
    donGia DECIMAL,
    maLoaiDichVu INT,
    FOREIGN KEY (maLoaiDichVu) REFERENCES LOAIDICHVU(maLoaiDichVu)
);

-- Mỗi bác sĩ có thể đăng ký ca khám dựa theo lịch cá nhân của mình, sau đó bệnh nhân sẽ book ca khám
CREATE TABLE CAKHAM (
    maCaKham INT PRIMARY KEY,
	ngayKham DATE,
    gioBatDau TIME,
    gioKetThuc TIME,
    moTa NVARCHAR(200),
	maNhaSi INT,
	FOREIGN KEY (maNhaSi) REFERENCES NHASI(maNhaSi)
);

CREATE TABLE LICHKHAM (
    maLichKham INT PRIMARY KEY,
    ngayDatLich DATE,
    trieuChung NVARCHAR(255),
    trangThai NVARCHAR(10),
    maBenhNhan INT,
    maNguoiDat INT,
    maCaKham INT,
    FOREIGN KEY (maBenhNhan) REFERENCES TAIKHOAN(maTaiKhoan),
    FOREIGN KEY (maNguoiDat) REFERENCES TAIKHOAN(maTaiKhoan),
    FOREIGN KEY (maCaKham) REFERENCES CAKHAM(maCaKham)
);

CREATE TABLE PHIEUKHAM (
    maPhieuKham INT PRIMARY KEY,
    ketQuaChuanDoan NVARCHAR(255),
    ngayTaiKham DATE,
    maLichKham INT,
    FOREIGN KEY (maLichKham) REFERENCES LICHKHAM(maLichKham)
);

CREATE TABLE CHITIETPHIEUKHAM (
    maPhieuKham INT,
    maDichVu INT,
    soLuong INT,
    ghiChu NVARCHAR(255),
    PRIMARY KEY (maPhieuKham, maDichVu),
    FOREIGN KEY (maPhieuKham) REFERENCES PHIEUKHAM(maPhieuKham),
    FOREIGN KEY (maDichVu) REFERENCES DICHVU(maDichVu)
);

CREATE TABLE HOADON (
    maHoaDon INT PRIMARY KEY,
    soTien DECIMAL,
    phuongThuc NVARCHAR(15),
    trangThai VARCHAR(30), -- đã thu tiền/chưa thu tiền
    ngaytao DATE,
    ngayThanhToan DATE, -- để biết có quá hạn thanh toán hay chưa
    maPhieuKham INT,
    FOREIGN KEY (maPhieuKham) REFERENCES PHIEUKHAM(maPhieuKham)
);

CREATE TABLE THONGBAO (
    maThongBao INT PRIMARY KEY AUTO_INCREMENT,
    maNguoiNhan INT,
    tieuDe NVARCHAR(200),
    noiDung NVARCHAR(500),
    ngayTao DATETIME,
    FOREIGN KEY (maNguoiNhan) REFERENCES TAIKHOAN(maTaiKhoan)
);


-- insert data

INSERT INTO QUYEN (maQuyen, tenQuyen) VALUES
(1, N'Admin'),
(2, N'Nha sĩ'),
(3, N'Bệnh nhân'),
(4, N'Lễ tân'),
(5, N'Chủ phòng khám');


INSERT INTO TAIKHOAN (maTaiKhoan, tenTaiKhoan, matKhau, hoTen, ngaySinh, gioiTinh, eMail, soDienThoai, diaChi, anh, maQuyen) VALUES
(1, 'admin01', '123456', N'Nguyễn Văn A', '1990-01-01', 'Nam', 'admin@example.com', '0912345678', N'123 Lý Thường Kiệt', N'https://avatar.iran.liara.run/public/29', 1),
(2, 'nha_si_01', 'abc123', N'Lê Thị B', '1985-05-12', 'Nữ', 'lethib@example.com', '0911222333', N'456 Trần Phú', N'https://avatar.iran.liara.run/public/29', 2),
(3, 'benhnhan01', 'xyz789', N'Phạm Văn C', '1995-08-22', 'Nam', 'phamc@example.com', '0988777666', N'789 Nguyễn Huệ', N'https://avatar.iran.liara.run/public/29', 3),
(4, 'le_tan_01', 'pass456', N'Trần Thị D', '1992-03-14', 'Nữ', 'trand@example.com', '0977554433', N'321 Hai Bà Trưng', N'https://avatar.iran.liara.run/public/29', 4),
(5, 'chuphongkham1', 'clinic123', N'Hoàng Văn E', '1980-11-11', 'Nam', 'hoange@example.com', '0909090909', N'654 Lê Lợi', N'https://avatar.iran.liara.run/public/29', 5);

INSERT INTO PHONGKHAM (maPhongKham, tenPhongKham, diaChi, soDienThoai, gioLamViec, maChuPhongKham, trangthai) VALUES
(1, N'Nha Khoa Ánh Dương', N'10 Trường Chinh, Q. Tân Bình', '0901234567', '08:00 - 17:00', 5, N'VIP');

INSERT INTO NHASI (maNhaSi, maTaiKhoan, maPhongKham, hoTen, kinhNghiem, chucVu, ghiChu) VALUES
(1, 2, 1, N'Lê Thị B', N'10 năm', N'Bác sĩ trưởng', N'Chuyên khoa chỉnh nha');

INSERT INTO DANHGIA (maDanhGia, maPhongKham, maBenhNhan, danhGia, binhLuan, NgayDanhGia) VALUES
(1, 1, 3, 5, N'Dịch vụ tốt, bác sĩ tận tình', '2024-12-01');

INSERT INTO LOAIDICHVU (maLoaiDichVu, tenLoaiDichVu) VALUES
(1, N'Khám tổng quát'),
(2, N'Trám răng'),
(3, N'Tẩy trắng răng');

INSERT INTO DICHVU (maDichVu, tenDichVu, moTa, donGia, maLoaiDichVu) VALUES
(1, N'Khám răng định kỳ', N'Kiểm tra tổng quát tình trạng răng miệng', 200000, 1),
(2, N'Trám răng thẩm mỹ', N'Sử dụng vật liệu composite', 500000, 2),
(3, N'Tẩy trắng răng Laser', N'Tẩy trắng hiệu quả bằng công nghệ Laser', 1000000, 3);

INSERT INTO CAKHAM (maCaKham, ngayKham, gioBatDau, gioKetThuc, moTa, maNhaSi) VALUES
(1, '2025-05-10', '08:00:00', '08:30:00', N'Ca khám sáng sớm', 1);

INSERT INTO LICHKHAM (maLichKham, ngayDatLich, trieuChung, trangThai, maBenhNhan, maNguoiDat, maCaKham) VALUES
(1, '2025-05-06', N'Đau nhức răng hàm dưới', N'Đã đặt', 3, 3, 1);

INSERT INTO PHIEUKHAM (maPhieuKham, ketQuaChuanDoan, ngayTaiKham, maLichKham) VALUES
(1, N'Sâu răng hàm dưới, cần trám', '2025-05-20', 1);

INSERT INTO CHITIETPHIEUKHAM (maPhieuKham, maDichVu, soLuong, ghiChu) VALUES
(1, 2, 1, N'Trám răng bằng vật liệu cao cấp');

INSERT INTO HOADON (maHoaDon, soTien, phuongThuc, trangThai, ngaytao, ngayThanhToan, maPhieuKham) VALUES
(1, 500000, N'Tiền mặt', 'Đã thanh toán', '2025-05-06', '2025-05-06', 1);

INSERT INTO THONGBAO (maNguoiNhan, tieuDe, noiDung, ngayTao) VALUES
(3, N'Lịch khám mới', N'Bạn đã đặt lịch khám thành công vào 10/05/2025 lúc 8h00', NOW());


