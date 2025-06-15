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

Balita.findByNikIbu = async (nik_ibu) => {
  const [rows] = await db.query('SELECT * FROM balita WHERE nik_ibu = ?', [nik_ibu]);
  return rows;
};

Balita.findAll = async () => {
  const [rows] = await db.query('SELECT * FROM balita');
  return rows;
};

Balita.update = async (id, dataBalita) => {
  const { nik_balita, nama_balita, jenis_kelamin, tempat_lahir, tanggal_lahir, alamat, nama_ibu, nik_ibu } = dataBalita;
  await db.query(
    'UPDATE balita SET nik_balita=?, nama_balita=?, jenis_kelamin=?, tempat_lahir=?, tanggal_lahir=?, alamat=?, nama_ibu=?, nik_ibu=? WHERE id_balita=?',
    [nik_balita, nama_balita, jenis_kelamin, tempat_lahir, tanggal_lahir, alamat, nama_ibu, nik_ibu, id]
  );
  return { id_balita: id, ...dataBalita };
};

Balita.delete = async (id) => {
  await db.query('DELETE FROM balita WHERE id_balita = ?', [id]);
};

module.exports = Balita;