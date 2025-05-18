const mysql = require('mysql2');
require('dotenv').config();


const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Kết nối database thất bại:', err.message);
  } else {
    console.log('✅ Kết nối database thành công');
  }
});

module.exports = connection;
