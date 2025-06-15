const db = require('../config/database');

// 
exports.checkImunisasiStatus = async (id_balita) => {
  // Ambil semua id vaksin dari tabel vaksin
  const [allVaksin] = await db.query(`SELECT id_vaksin FROM vaksin`);

  // Ambil semua id vaksin yang sudah diberikan ke balita ini
  const [balitaVaksin] = await db.query(
    `SELECT DISTINCT id_vaksin FROM imunisasi WHERE id_balita = ?`,
    [id_balita]
  );

  // Ubah hasil ke bentuk Set untuk pengecekan cepat
  const semuaIdVaksin = new Set(allVaksin.map(v => v.id_vaksin));
  const vaksinBalita = new Set(balitaVaksin.map(v => v.id_vaksin));

  // Bandingkan, apakah semua id_vaksin sudah ada di vaksinBalita
  const isComplete = [...semuaIdVaksin].every(v => vaksinBalita.has(v));

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
