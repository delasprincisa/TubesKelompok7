const db = require('../config/database');

// Cek imunisasi status (kalau id balita tersebut di cek sudah memenuhi baru nanti pdf fi generate)
exports.checkImunisasiStatus = async (id_balita) => {
  const [rows] = await db.query(
    `SELECT status FROM imunisasi WHERE id_balita = ?`,
    [id_balita]
  );

  if (!rows || rows.length === 0) {
    return { status: 'incomplete' };
  }

  const isComplete = rows.every(row => row.status === 'completed');

  return {
    status: isComplete ? 'completed' : 'incomplete'
  };
};

// Cek data balita untuk dimasukkan ke sertifikat
exports.getBalitaDetails = async (id_balita) => {
  const [rows] = await db.query(
    `SELECT b.id_balita, b.nik_balita, b.nama_balita, b.jenis_kelamin, 
            b.tempat_lahir, b.tanggal_lahir, b.alamat, b.nama_ibu
     FROM balita b
     WHERE b.id_balita = ?`,
    [id_balita]
  );

  return rows[0];
};
