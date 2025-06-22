const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/hoaDonController');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.post('/with-details', ctrl.createWithDetails);
router.get('/:id/details', ctrl.getDetailWithServices);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.delete);
router.get('/patient/:maBenhNhan/doctor/:maNhaSi', ctrl.getByPatientAndDoctor);

module.exports = router;
