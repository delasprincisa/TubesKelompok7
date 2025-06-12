const db = require('../config/database');
const Balita = {};

Balita.create = async (dataBalita) => {
  const { nik_balita, nama_balita, jenis_kelamin, tempat_lahir, tanggal_lahir, alamat, nama_ibu, nik_ibu } = dataBalita;
  const [result] = await db.query(
    'INSERT INTO balita (nik_balita, nama_balita, jenis_kelamin, tempat_lahir, tanggal_lahir, alamat, nama_ibu, nik_ibu) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [nik_balita, nama_balita, jenis_kelamin, tempat_lahir, tanggal_lahir, alamat, nama_ibu, nik_ibu]
  );
  return { id_balita: result.insertId, ...dataBalita };
};

Balita.findById = async (id) => {
  const [rows] = await db.query('SELECT * FROM balita WHERE id_balita = ?', [id]);
  return rows[0];
};

module.exports = Balita;