// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const multer = require('multer');

// Đặt tên file theo timestamp
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop();
    cb(null, `${Date.now()}.${ext}`);
  }
});
const upload = multer({ storage });

router.post('/register', upload.single('anh'), userController.register);
router.post('/login', userController.loginUser);
router.put('/edit/:id', upload.single('anh'), userController.editUser);
router.delete('/delete/:id', userController.deleteUser);
router.put('/account/:tenTaiKhoan', userController.updateAccount);
router.get('/full', userController.getFullUserList);

module.exports = router;
