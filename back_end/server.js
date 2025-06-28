const express = require('express');
const cors = require('cors');
require('dotenv').config();
const bodyParser = require('body-parser');
const path = require('path');


const quyenRoutes = require('./src/routers/quyenRoutes');
const userRoutes = require('./src/routers/userRoutes');
const phongKhamRoutes = require('./src/routers/phongKhamRoutes');
const nhaSiRoutes = require('./src/routers/nhaSiRoutes');
const danhGia = require('./src/routers/danhGiaRoutes');
const loaiDichVu = require('./src/routers/loaiDichVuRoutes');
const dichVu = require('./src/routers/dichVuRoutes');
const caKham = require('./src/routers/caKhamRoutes');
const phieuKham = require('./src/routers/phieuKhamRoutes');
const lichKham = require('./src/routers/lichKhamRoutes');
const thongBao = require('./src/routers/thongBaoRoutes');
const chiTietPhieuKham = require('./src/routers/chiTietPhieuKhamRoutes');
const hoaDon = require('./src/routers/hoaDonRoutes');
const blog = require('./src/routers/blogRoutes');




const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());

app.use(express.json());

app.use(bodyParser.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Routes

// test API
const routes = require('./src/routers/index');
app.use('/api', routes);

// quyen
app.use('/api/quyen', quyenRoutes);
// user
app.use('/api/users', userRoutes);

app.use('/api/phongkham', phongKhamRoutes);

app.use('/api/nhasi', nhaSiRoutes);

app.use('/api/danhgia', danhGia);

app.use('/api/loaidichvu', loaiDichVu);

app.use('/api/dichvu', dichVu);

app.use('/api/cakham', caKham);

app.use('/api/phieukham', phieuKham);

app.use('/api/lichkham', lichKham);

app.use('/api/chitietphieukham', chiTietPhieuKham);

app.use('/api/hoadon', hoaDon);

app.use('/api/thongbao', thongBao);

app.use('/api/blog', blog);



// Default 404 route
app.use((req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
