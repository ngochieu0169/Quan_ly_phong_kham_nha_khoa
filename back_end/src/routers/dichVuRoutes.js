const express = require('express');
const router = express.Router();
const controller = require('../controllers/dichVuController');
const { uploadSingle } = require('../middlewares/uploadMiddleware');

router.get('/', controller.getAll);
router.get('/search', controller.search);
router.get('/by-type/:typeId', controller.getByType);
router.get('/:id', controller.getById);
router.post('/', uploadSingle, controller.create);
router.put('/:id', uploadSingle, controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
