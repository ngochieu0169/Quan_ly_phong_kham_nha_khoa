const db = require('../configs/database');

const Quyen = {
  getAll: (callback) => {
    db.query('SELECT * FROM QUYEN', callback);
  },

  getById: (id, callback) => {
    db.query('SELECT * FROM QUYEN WHERE maQuyen = ?', [id], callback);
  },

  create: (tenQuyen, callback) => {
    db.query('INSERT INTO QUYEN (tenQuyen) VALUES (?)', [tenQuyen], callback);
  },

  update: (id, tenQuyen, callback) => {
    db.query('UPDATE QUYEN SET tenQuyen = ? WHERE maQuyen = ?', [tenQuyen, id], callback);
  },

  delete: (id, callback) => {
    db.query('DELETE FROM QUYEN WHERE maQuyen = ?', [id], callback);
  },
};

module.exports = Quyen;
