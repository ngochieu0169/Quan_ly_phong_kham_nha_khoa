const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/chiTietPhieuKhamController');

router.get('/', ctrl.getAll);
router.get('/:maPhieuKham/:maDichVu', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:maPhieuKham/:maDichVu', ctrl.update);
router.delete('/:maPhieuKham/:maDichVu', ctrl.delete);

module.exports = router;
