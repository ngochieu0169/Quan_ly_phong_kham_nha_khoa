const mysql = require('mysql2');
require('dotenv').config();

console.log('DB_HOST:', process.env.DB_HOST || 'localhost');

const connection = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "PROJECT_PHONGKHAM",
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Kết nối database thất bại:', err.message);
  } else {
    console.log('✅ Kết nối database thành công');
  }
});

module.exports = connection;
