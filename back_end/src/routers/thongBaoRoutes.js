const express = require('express');
const router = express.Router();
const thongBaoController = require('../controllers/thongBaoController');

// GET tất cả thông báo
router.get('/', thongBaoController.getAllThongBao);

// GET thông báo theo id
router.get('/:id', thongBaoController.getThongBaoById);

// POST tạo thông báo mới
router.post('/', thongBaoController.createThongBao);

// PUT cập nhật thông báo theo id
router.put('/:id', thongBaoController.updateThongBao);

// DELETE xóa thông báo theo id
router.delete('/:id', thongBaoController.deleteThongBao);

module.exports = router;
