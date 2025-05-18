const express = require('express');
const router = express.Router();
const db = require('../configs/database');

router.get('/test', (req, res) => {
  const sql = 'select * from NGUOIDUNG'
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

module.exports = router;
