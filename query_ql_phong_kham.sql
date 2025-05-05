create database PROJECT_PHONGKHAM

use PROJECT_PHONGKHAM;

-- drop database PROJECT_PHONGKHAM


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
    giaKhamChung DECIMAL,
    maChuPhongKham INT,
    FOREIGN KEY (maChuPhongKham) REFERENCES TAIKHOAN(maTaiKhoan)
);

CREATE TABLE NHASI (
    maNhaSi INT,
    maPhongKham INT,
    hoTen NVARCHAR(200),
    kinhNghiem NVARCHAR(50),
    chucVu NVARCHAR(50),
    ghiChu NVARCHAR(255),
    PRIMARY KEY (maNhaSi),
    FOREIGN KEY (maPhongKham) REFERENCES PHONGKHAM(maPhongKham)
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

CREATE TABLE CAKHAM (
    maCaKham INT PRIMARY KEY,
    gioBatDau TIME,
    gioKetThuc TIME,
    moTa NVARCHAR(200)
);

CREATE TABLE LICHKHAM (
    maLichKham INT PRIMARY KEY,
    ngayDatLich DATE,
    trieuChung NVARCHAR(255),
    trangThai NVARCHAR(10),
    maBenhNhan INT,
    maNhaSi INT,
    maPhongKham INT,
    maCaKham INT,
    FOREIGN KEY (maBenhNhan) REFERENCES TAIKHOAN(maTaiKhoan),
    FOREIGN KEY (maNhaSi) REFERENCES NHASI(maNhaSi),
    FOREIGN KEY (maPhongKham) REFERENCES PHONGKHAM(maPhongKham),
    FOREIGN KEY (maCaKham) REFERENCES CAKHAM(maCaKham)
);

CREATE TABLE PhieuKham (
    maPhieuKham INT PRIMARY KEY,
    ngayKham DATE,
    TrieuChung NVARCHAR(255),
    ketQuaChuanDoan NVARCHAR(255),
    ngayTaiKham DATE,
    maLichKham INT,
    maNhaSi INT,
    FOREIGN KEY (maLichKham) REFERENCES LICHKHAM(maLichKham),
    FOREIGN KEY (maNhaSi) REFERENCES NHASI(maNhaSi)
);

CREATE TABLE CHITIETPHIEUKHAM (
    maPhieuKham INT,
    maDichVu INT,
    soLuong INT,
    ghiChu NVARCHAR(255),
    PRIMARY KEY (maPhieuKham, maDichVu),
    FOREIGN KEY (maPhieuKham) REFERENCES PhieuKham(maPhieuKham),
    FOREIGN KEY (maDichVu) REFERENCES DICHVU(maDichVu)
);

CREATE TABLE HOADON (
    maHoaDon INT PRIMARY KEY,
    soTien DECIMAL,
    phuongThuc NVARCHAR(15),
    ngayThanhToan DATE,
    maPhieuKham INT,
    FOREIGN KEY (maPhieuKham) REFERENCES PhieuKham(maPhieuKham)
);

-- insert data

INSERT INTO QUYEN VALUES
(1, N'Khách vãng lai'),
(2, N'Bệnh nhân'),
(3, N'Lễ tân'),
(4, N'Nha sĩ'),
(5, N'Chủ phòng khám'),
(6, N'Quản trị viên');

INSERT INTO TAIKHOAN VALUES
(1, 'khanh123', 'matkhau1', N'Nguyễn Văn Khánh', '1995-03-15', 'Nam', 'khanh@gmail.com', '0912345678', N'123 Lê Lợi, Quận 1', N'https://avatar.iran.liara.run/public/29', 2),
(2, 'tuanpt', '123456', N'Phạm Tuấn', '1990-11-22', 'Nam', 'tuanpt@gmail.com', '0987654321', N'45 Pasteur, Quận 3', N'https://avatar.iran.liara.run/public/20', 4),
(3, 'lienle', 'mk987', N'Lê Thị Liên', '1988-08-08', 'Nữ', 'lienle@gmail.com', '0911111111', N'78 Nguyễn Trãi, Q5', N'https://avatar.iran.liara.run/public/35', 3),
(4, 'admin', 'admin123', N'Quản Trị Viên', '1980-01-01', 'Nam', 'admin@admin.com', '0900000000', N'Hệ thống', N'https://avatar.iran.liara.run/public/16', 6),
(5, 'chuPK', 'pk123', N'Ngô Thị Mai', '1985-05-05', 'Nữ', 'ngomai@gmail.com', '0901122334', N'01 Hùng Vương, Q1', N'https://avatar.iran.liara.run/public/37', 5);

INSERT INTO PHONGKHAM VALUES
(1, N'Phòng khám An Khang', N'123 Trần Hưng Đạo, Quận 5', '0283456789', 'T2-T6: 8h-17h', 200000, 5),
(2, N'Phòng khám Răng Xinh', N'456 Nguyễn Văn Cừ, Quận 1', '0282222333', 'T2-T7: 9h-18h', 250000, 5);

INSERT INTO NHASI VALUES
(101, 1, N'Phạm Tuấn', N'10 năm', N'Bác sĩ trưởng', N'Chuyên sâu niềng răng'),
(102, 2, N'Lê Minh Hùng', N'5 năm', N'Nha sĩ tổng quát', N'Chuyên khám răng sâu');

INSERT INTO DANHGIA VALUES
(1, 1, 1, 5, N'Rất hài lòng', '2024-05-01'),
(2, 2, 1, 4, N'Phục vụ tốt', '2024-05-02'),
(3, 1, 1, 3, N'Bình thường', '2024-05-03');

INSERT INTO LOAIDICHVU VALUES
(1, N'Tổng quát'),
(2, N'Chỉnh nha'),
(3, N'Tẩy trắng');

INSERT INTO DICHVU VALUES
(1, N'Khám tổng quát', N'Kiểm tra răng miệng', 200000, 1),
(2, N'Niềng răng', N'Sửa lệch hàm', 15000000, 2),
(3, N'Tẩy trắng răng', N'Sử dụng công nghệ laser', 3000000, 3);

INSERT INTO CAKHAM VALUES
(1, '07:00:00', '08:00:00', N'Ca sáng sớm'),
(2, '08:00:00', '09:00:00', N'Ca sáng'),
(3, '14:00:00', '15:00:00', N'Ca chiều');

INSERT INTO LICHKHAM VALUES
(1, '2024-05-10', N'Đau nhức răng', N'Chờ', 1, 101, 1, 1),
(2, '2024-05-11', N'Hôi miệng', N'Xác nhận', 1, 102, 2, 2),
(3, '2024-05-12', N'Răng mọc lệch', N'Đã khám', 1, 101, 1, 3);

INSERT INTO PhieuKham VALUES
(1, '2024-05-10', N'Đau nhức răng', N'Sâu răng hàm', '2024-06-10', 1, 101),
(2, '2024-05-11', N'Hôi miệng', N'Viêm lợi nhẹ', NULL, 2, 102);

INSERT INTO CHITIETPHIEUKHAM VALUES
(1, 1, 1, N'Khám tổng quát'),
(1, 3, 1, N'Áp dụng tẩy trắng'),
(2, 1, 1, N'Khám ban đầu');

INSERT INTO HOADON VALUES
(1, 3200000, N'Tiền mặt', '2024-05-10', 1),
(2, 200000, N'Chuyển khoản', '2024-05-11', 2);
