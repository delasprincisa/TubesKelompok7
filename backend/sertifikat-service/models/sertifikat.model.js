const db = require('../config/database');
const Sertifikat = {};

Sertifikat.create = async (id_balita, url_sertifikat) => {
    // Cek dulu apakah sudah ada, jika ada, update saja. Jika tidak, baru insert.
    const [existing] = await db.query('SELECT * FROM sertifikat WHERE id_balita = ?', [id_balita]);
    if (existing.length > 0) {
        const [result] = await db.query(
            'UPDATE sertifikat SET url_sertifikat = ?, tanggal_terbit = CURRENT_TIMESTAMP WHERE id_balita = ?',
            [url_sertifikat, id_balita]
        );
        return { id_sertifikat: existing[0].id_sertifikat };
    } else {
        const [result] = await db.query(
            'INSERT INTO sertifikat (id_balita, url_sertifikat) VALUES (?, ?)',
            [id_balita, url_sertifikat]
        );
        return { id_sertifikat: result.insertId };
    }
};

module.exports = Sertifikat;