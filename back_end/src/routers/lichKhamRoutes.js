const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/lichKhamController');

router.get('/', ctrl.getAll);
router.get('/pending-doctor-assignment', ctrl.getPendingDoctorAssignment);
router.get('/doctor/:maNhaSi', ctrl.getByDoctor);
router.get('/doctor/:maNhaSi/patients', ctrl.getPatientsByDoctor);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', ctrl.confirmBooking);
router.delete('/:id', ctrl.delete);

module.exports = router;
