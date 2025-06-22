// routes/phongKhamRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/phongKhamController');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.get('/owner/:ownerUsername', ctrl.getByOwner);
router.get('/:id/revenue', ctrl.getRevenue);
router.get('/:id/stats', ctrl.getStats);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.delete);

module.exports = router;
