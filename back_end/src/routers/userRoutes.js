// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const multer = require('multer');
const upload = require("../middlewares/upload");


router.post('/register', upload.single('anh'), userController.register);
router.post('/login', userController.loginUser);
router.put('/:maNguoiDung', upload.single('anh'), userController.updateNguoiDung);
router.delete('/delete/:id', userController.deleteUser);
router.put('/account/:tenTaiKhoan', userController.updateAccount);
router.get('/full', userController.getFullUserList);

module.exports = router;
