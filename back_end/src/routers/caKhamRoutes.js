const express = require('express');
const router = express.Router();
const controller = require('../controllers/caKhamController');

router.get('/', controller.getAll);
// router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);
router.get('/lich-trong', controller.lichTrong);
router.get('/bac-si', controller.getBacSiSchedule);

module.exports = router;
