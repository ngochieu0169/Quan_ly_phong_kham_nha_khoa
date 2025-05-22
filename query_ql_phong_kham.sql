create database PROJECT_PHONGKHAM

use PROJECT_PHONGKHAM;

-- drop database PROJECT_PHONGKHAM

select * from NGUOIDUNG

CREATE TABLE QUYEN (
    maQuyen INT PRIMARY KEY AUTO_INCREMENT,
    tenQuyen NVARCHAR(50)
);

CREATE TABLE NGUOIDUNG (
    maNguoiDung INT PRIMARY KEY AUTO_INCREMENT,
    hoTen NVARCHAR(50),
    ngaySinh DATE,
    gioiTinh VARCHAR(10),
    eMail VARCHAR(50),
    soDienThoai VARCHAR(10),
    diaChi NVARCHAR(200),
    anh VARCHAR(200)
);


CREATE TABLE TAIKHOAN (
    tenTaiKhoan VARCHAR(50) PRIMARY KEY,
    matKhau VARCHAR(50),
    maQuyen INT,
    maNguoiDung INT UNIQUE NOT NULL,
    FOREIGN KEY (maNguoiDung) REFERENCES NGUOIDUNG(maNguoiDung),
    FOREIGN KEY (maQuyen) REFERENCES QUYEN(maQuyen)
);


CREATE TABLE PHONGKHAM (
    maPhongKham INT PRIMARY KEY AUTO_INCREMENT,
    tenPhongKham NVARCHAR(50),
    diaChi NVARCHAR(200),
    soDienThoai VARCHAR(10),
    gioLamViec VARCHAR(50),
    maChuPhongKham VARCHAR(50),
    trangthai NVARCHAR(20), -- duyệt hoặc chưa duyệt, uy tín, VIP...
    FOREIGN KEY (maChuPhongKham) REFERENCES TAIKHOAN(tenTaiKhoan)
);

CREATE TABLE NHASI (
    maNhaSi VARCHAR(50) PRIMARY KEY, -- giống như tenTaiKhoan, làm khóa chính
    maPhongKham INT,
    hoTen NVARCHAR(200),
    kinhNghiem NVARCHAR(50),
    chucVu NVARCHAR(50),
    ghiChu NVARCHAR(255),
    FOREIGN KEY (maNhaSi) REFERENCES TAIKHOAN(tenTaiKhoan),
    FOREIGN KEY (maPhongKham) REFERENCES PHONGKHAM(maPhongKham)
);


CREATE TABLE DANHGIA (
    maDanhGia INT PRIMARY KEY AUTO_INCREMENT,
    maPhongKham INT,
	tenTaiKhoan VARCHAR(50),
    danhGia INT,
    binhLuan NVARCHAR(255),
    NgayDanhGia DATE,
    FOREIGN KEY (maPhongKham) REFERENCES PHONGKHAM(maPhongKham),
    FOREIGN KEY (tenTaiKhoan) REFERENCES TAIKHOAN(tenTaiKhoan)
);

CREATE TABLE LOAIDICHVU (
    maLoaiDichVu INT PRIMARY KEY AUTO_INCREMENT,
    tenLoaiDichVu NVARCHAR(200)
);

CREATE TABLE DICHVU (
    maDichVu INT PRIMARY KEY AUTO_INCREMENT,
    tenDichVu NVARCHAR(200),
    moTa NVARCHAR(255),
    donGia DECIMAL,
    anh VARCHAR(255),
    maLoaiDichVu INT,
    FOREIGN KEY (maLoaiDichVu) REFERENCES LOAIDICHVU(maLoaiDichVu)
);

-- Mỗi bác sĩ có thể đăng ký ca khám dựa theo lịch cá nhân của mình, sau đó bệnh nhân sẽ book ca khám
CREATE TABLE CAKHAM (
    maCaKham INT PRIMARY KEY AUTO_INCREMENT,
	ngayKham DATE,
    gioBatDau TIME,
    gioKetThuc TIME,
    moTa NVARCHAR(200),
	maNhaSi VARCHAR(50),
	FOREIGN KEY (maNhaSi) REFERENCES NHASI(maNhaSi)
);


CREATE TABLE LICHKHAM (
    maLichKham INT PRIMARY KEY AUTO_INCREMENT,
    ngayDatLich DATE,
    trieuChung NVARCHAR(255),
    trangThai NVARCHAR(10),
    maBenhNhan INT,
    maNguoiDat VARCHAR(50),
    quanHeBenhNhanVaNguoiDat NVARCHAR(50),
    maCaKham INT,
    FOREIGN KEY (maBenhNhan) REFERENCES NGUOIDUNG(maNguoiDung),
    FOREIGN KEY (maNguoiDat) REFERENCES TAIKHOAN(tenTaiKhoan),
    FOREIGN KEY (maCaKham) REFERENCES CAKHAM(maCaKham)
);

CREATE TABLE PHIEUKHAM (
    maPhieuKham INT PRIMARY KEY AUTO_INCREMENT,
    ketQuaChuanDoan NVARCHAR(255),
    ngayTaiKham DATE,
    maLichKham INT,
    FOREIGN KEY (maLichKham) REFERENCES LICHKHAM(maLichKham)
);

CREATE TABLE CHITIETPHIEUKHAM (
    maPhieuKham INT AUTO_INCREMENT,
    maDichVu INT,
    soLuong INT,
    ghiChu NVARCHAR(255),
    PRIMARY KEY (maPhieuKham, maDichVu),
    FOREIGN KEY (maPhieuKham) REFERENCES PHIEUKHAM(maPhieuKham),
    FOREIGN KEY (maDichVu) REFERENCES DICHVU(maDichVu)
);

CREATE TABLE HOADON (
    maHoaDon INT PRIMARY KEY AUTO_INCREMENT,
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
    maNguoiNhan VARCHAR(50),
    tieuDe NVARCHAR(200),
    noiDung NVARCHAR(500),
    ngayTao DATETIME,
    FOREIGN KEY (maNguoiNhan) REFERENCES TAIKHOAN(tenTaiKhoan)
);


-- insert data

-- QUYEN
INSERT INTO QUYEN (maQuyen, tenQuyen) VALUES (1, N'Quản trị viên');
INSERT INTO QUYEN (maQuyen, tenQuyen) VALUES (2, N'Bác sĩ');
INSERT INTO QUYEN (maQuyen, tenQuyen) VALUES (3, N'Lễ tân');
INSERT INTO QUYEN (maQuyen, tenQuyen) VALUES (4, N'Bệnh nhân');
INSERT INTO QUYEN (maQuyen, tenQuyen) VALUES (5, N'Chủ phòng khám');



-- NGUOIDUNG
INSERT INTO NGUOIDUNG (hoTen, ngaySinh, gioiTinh, eMail, soDienThoai, diaChi, anh) VALUES 
(N'Nguyễn Văn A', '1990-01-01', 'Nam', 'a@example.com', '0900000001', N'Hà Nội', 'https://avatar.iran.liara.run/public/27'),
(N'Lê Thị B', '1992-02-02', 'Nữ', 'b@example.com', '0900000002', N'Đà Nẵng', 'https://avatar.iran.liara.run/public/27'),
(N'Trần Văn C', '1985-03-03', 'Nam', 'c@example.com', '0900000003', N'Hồ Chí Minh', 'https://avatar.iran.liara.run/public/46'),
(N'Phạm Thị D', '1995-04-04', 'Nữ', 'd@example.com', '0900000004', N'Cần Thơ', 'https://avatar.iran.liara.run/public/12'),
(N'Hoàng Văn E', '1988-05-05', 'Nam', 'e@example.com', '0900000005', N'Hải Phòng', 'https://avatar.iran.liara.run/public/12'),
(N'Hoàng Văn F', '1988-05-05', 'Nam', 'e@example.com', '0900000005', N'Hải Phòng', 'https://avatar.iran.liara.run/public/12'),
(N'Hoàng Văn M', '1988-05-05', 'Nam', 'e@example.com', '0900000005', N'Hải Phòng', 'https://avatar.iran.liara.run/public/12'),
(N'Hoàng Văn O', '1988-05-05', 'Nam', 'e@example.com', '0900000005', N'Hải Phòng', 'https://avatar.iran.liara.run/public/12'),
(N'Hoàng Văn Phap', '1988-05-05', 'Nam', 'e@example.com', '0900000005', N'Hải Phòng', 'https://avatar.iran.liara.run/public/12'),
(N'Hoàng Văn Em', '1988-05-05', 'Nam', 'e@example.com', '0900000005', N'Hải Phòng', 'https://avatar.iran.liara.run/public/12'),
(N'Hoàng Văn Linh', '1988-05-05', 'Nam', 'e@example.com', '0900000005', N'Hải Phòng', 'https://avatar.iran.liara.run/public/12');

-- INSERT INTO NGUOIDUNG (hoTen, ngaySinh, gioiTinh, eMail, soDienThoai, diaChi, anh) VALUES 
-- (N'Nguyễn Hoàng Phúc', '1988-05-05', 'Nam', 'e@example.com', '0900000005', N'Hải Phòng', 'https://avatar.iran.liara.run/public/12');

select * from NGUOIDUNG
-- TAIKHOAN
INSERT INTO TAIKHOAN (tenTaiKhoan, matKhau, maQuyen, maNguoiDung) VALUES 
('admin', '123456', 1, 1),
('bacsi1', '123456', 2, 2),
('bacsi2', '123456', 2, 6),
('bacsi3', '123456', 2, 7),
('bacsi4', '123456', 2, 8),
('bacsi5', '123456', 2, 9),
('letan1', '123456', 3, 10),
('benhnhan1', '123456', 4, 4),
('benhnhan2', '123456', 4, 5);

-- INSERT INTO TAIKHOAN (tenTaiKhoan, matKhau, maQuyen, maNguoiDung) VALUES 
-- ('chuphongkham', '123456', 5, 12);

-- PHONGKHAM
INSERT INTO PHONGKHAM (tenPhongKham, diaChi, soDienThoai, gioLamViec, maChuPhongKham, trangthai) VALUES 
(N'Phòng khám A', N'123 Đường A', '0911000001', N'08:00 - 17:00', 'admin', N'duyệt'),
(N'Phòng khám B', N'456 Đường B', '0911000002', N'09:00 - 18:00', 'admin', N'duyệt'),
(N'Phòng khám C', N'789 Đường C', '0911000003', N'07:30 - 16:30', 'admin', N'chưa duyệt'),
(N'Phòng khám D', N'321 Đường D', '0911000004', N'08:00 - 17:00', 'admin', N'VIP'),
(N'Phòng khám E', N'654 Đường E', '0911000005', N'09:00 - 18:00', 'admin', N'uy tín');

-- NHASI
INSERT INTO NHASI (maNhaSi, maPhongKham, hoTen, kinhNghiem, chucVu, ghiChu) VALUES
('bacsi1', 1, N'Nguyễn Bác Sĩ', N'10 năm', N'Trưởng khoa', N'Chuyên điều trị răng hàm mặt'),
('bacsi2', 2, N'Lê Nha Sĩ', N'5 năm', N'Nha sĩ chính', N'Kinh nghiệm điều trị tủy'),
('bacsi3', 3, N'Trần Nha Khoa', N'7 năm', N'Phó khoa', N'Đặc biệt giỏi trám răng'),
('bacsi4', 4, N'Phạm Chuyên Gia', N'12 năm', N'Chuyên gia', N'Kỹ thuật cao'),
('bacsi5', 5, N'Hoàng Chẩn Đoán', N'8 năm', N'Bác sĩ', N'Tư vấn nhiệt tình');

-- DANHGIA
INSERT INTO DANHGIA (maPhongKham, tenTaiKhoan, danhGia, binhLuan, NgayDanhGia) VALUES
(1, 'benhnhan1', 5, N'Dịch vụ tốt', '2024-01-01'),
(2, 'benhnhan2', 4, N'Tốt nhưng chờ hơi lâu', '2024-02-02'),
(3, 'benhnhan1', 3, N'Phòng khám sạch sẽ', '2024-03-03'),
(4, 'benhnhan2', 5, N'Tư vấn nhiệt tình', '2024-04-04'),
(5, 'benhnhan1', 2, N'Cần cải thiện giờ giấc', '2024-05-05');

-- LOAIDICHVU
INSERT INTO LOAIDICHVU (tenLoaiDichVu) VALUES
(N'Khám tổng quát'),
(N'Trám răng'),
(N'Lấy cao răng'),
(N'Tẩy trắng răng'),
(N'Niềng răng');

-- DICHVU
INSERT INTO DICHVU (tenDichVu, moTa, donGia, anh, maLoaiDichVu) VALUES
(N'Khám răng tổng quát', N'Kiểm tra toàn bộ răng miệng', 150000, '',1),
(N'Trám răng sâu', N'Trám các lỗ sâu', 300000, '', 2),
(N'Lấy cao răng siêu âm', N'Sử dụng máy siêu âm để lấy cao', 200000, '', 3),
(N'Tẩy trắng răng cơ bản', N'Tẩy trắng bằng gel', 500000, '',4),
(N'Niềng răng mắc cài', N'Niềng răng bằng mắc cài kim loại', 9500000, '', 5);

-- CAKHAM
INSERT INTO CAKHAM (ngayKham, gioBatDau, gioKetThuc, moTa, maNhaSi) VALUES
('2024-06-01', '08:00:00', '09:00:00', N'Ca sáng khám tổng quát', 'bacsi1'),
('2024-06-01', '09:00:00', '10:00:00', N'Ca sáng trám răng', 'bacsi2'),
('2024-06-02', '08:00:00', '09:00:00', N'Khám lấy cao răng', 'bacsi3'),
('2024-06-02', '09:00:00', '10:00:00', N'Tẩy trắng răng', 'bacsi1'),
('2024-06-03', '10:00:00', '11:00:00', N'Tư vấn niềng răng', 'bacsi4');

-- LICHKHAM

INSERT INTO LICHKHAM (ngayDatLich, trieuChung, trangThai, maBenhNhan, maNguoiDat, quanHeBenhNhanVaNguoiDat, maCaKham) VALUES
('2024-05-25', N'Đau răng hàm dưới', N'Chờ', 1, 'benhnhan1', N'Tôi', 1),
('2024-05-26', N'Sâu răng, ê buốt', N'Chờ', 2, 'benhnhan1', N'Con', 2),
('2024-05-27', N'Cao răng nhiều, hôi miệng', N'Chờ', 3, 'benhnhan1', N'Chồng', 3),
('2024-05-28', N'Răng xỉn màu, muốn tẩy trắng', N'Xác nhận', 4, 'benhnhan2', N'Bạn', 4),
('2024-05-29', N'Muốn tư vấn niềng răng', N'Chờ', 5, 'benhnhan2', N'Tôi', 5);

-- PHIEUKHAM
INSERT INTO PHIEUKHAM (ketQuaChuanDoan, ngayTaiKham, maLichKham) VALUES
(N'Sâu răng nhẹ', '2024-06-10', 6),
(N'Cần trám lại', '2024-06-15', 7),
(N'Không phát hiện vấn đề', NULL, 8),
(N'Nên làm sạch kỹ hơn', '2024-06-20', 9),
(N'Cần niềng chỉnh hình', '2024-06-30', 10);

-- CHITIETPHIEUKHAM
INSERT INTO CHITIETPHIEUKHAM (maDichVu, soLuong, ghiChu) VALUES
(1, 1, N'Trám 1 răng'),
(2, 2, N'Trám 2 răng hàm'),
(3, 1, N'Lấy cao răng siêu âm'),
(4, 1, N'Tẩy trắng cơ bản'),
(5, 1, N'Tư vấn niềng mắc cài');

-- HOADON
INSERT INTO HOADON (soTien, phuongThuc, trangThai, ngaytao, ngayThanhToan, maPhieuKham) VALUES
(300000, N'Tiền mặt', 'Đã thu tiền', '2024-06-01', '2024-06-01', 6),
(600000, N'Chuyển khoản', 'Đã thu tiền', '2024-06-02', '2024-06-03', 7),
(200000, N'Tiền mặt', 'Chưa thu tiền', '2024-06-03', NULL, 8),
(500000, N'VNPay', 'Đã thu tiền', '2024-06-04', '2024-06-04', 9),
(15000000, N'Chuyển khoản', 'Chưa thu tiền', '2024-06-05', NULL, 10);

-- THONGBAO
INSERT INTO THONGBAO (maNguoiNhan, tieuDe, noiDung, ngayTao) VALUES
('benhnhan1', N'Lịch khám sắp tới', N'Bạn có lịch khám vào ngày 2024-06-01', NOW()),
('benhnhan2', N'Xác nhận lịch khám', N'Lịch khám của bạn đã được xác nhận', NOW()),
('benhnhan1', N'Nhắc thanh toán', N'Vui lòng thanh toán hóa đơn số 3', NOW()),
('benhnhan2', N'Thông báo kết quả khám', N'Kết quả khám đã có trong hệ thống', NOW()),
('benhnhan1', N'Khuyến mãi dịch vụ', N'Giảm 10% dịch vụ tẩy trắng răng trong tuần này', NOW());
