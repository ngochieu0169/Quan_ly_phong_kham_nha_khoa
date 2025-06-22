// routes/nhaSiRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/nhaSiController');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.get('/phongkham/:clinicId', ctrl.getByClinic);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.delete);

module.exports = router;
