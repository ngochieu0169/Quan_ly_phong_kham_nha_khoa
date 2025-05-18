const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // thư mục lưu ảnh
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const timestamp = Date.now();
    cb(null, `${timestamp}${ext}`);
  },
});

const upload = multer({ storage });

module.exports = upload;
