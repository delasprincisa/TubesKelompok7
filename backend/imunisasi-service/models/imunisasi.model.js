// imunisasi-service/models/imunisasi.model.js
const db = require('../config/database'); 

const ImunisasiModel = {};

// Metode untuk Tabel VAKSIN

/**
 * Mengambil semua jenis vaksin dari tabel 'vaksin'.
 * @returns {Array<object>} Array berisi semua objek vaksin.
 */
ImunisasiModel.findAllVaksins = async () => {
    const [rows] = await db.query('SELECT * FROM vaksin');
    return rows;
};

/**
 * Menambah jenis vaksin baru ke tabel 'vaksin'.
 * @param {string} nama_vaksin - Nama vaksin yang akan ditambahkan.
 * @returns {object} Objek vaksin yang baru dibuat dengan id_vaksin.
 * @throws {Error} Jika nama vaksin sudah terdaftar atau terjadi kesalahan database.
 */
ImunisasiModel.createVaksin = async (nama_vaksin) => {
    try {
        const [result] = await db.query('INSERT INTO vaksin (nama_vaksin) VALUES (?)', [nama_vaksin]);
        return { id_vaksin: result.insertId, nama_vaksin };
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            throw new Error('Nama vaksin sudah terdaftar.');
        }
        throw new Error(`Gagal membuat vaksin: ${error.message}`);
    }
};

/**
 * Memperbarui nama vaksin berdasarkan ID.
 * @param {number} id_vaksin - ID unik dari vaksin yang akan diperbarui.
 * @param {string} nama_vaksin - Nama baru untuk vaksin.
 * @returns {boolean} True jika pembaruan berhasil, false jika tidak ada vaksin dengan ID tersebut.
 * @throws {Error} Jika nama vaksin baru sudah terdaftar (pada vaksin lain) atau error database lainnya.
 */
ImunisasiModel.updateVaksin = async (id_vaksin, nama_vaksin) => {
    try {
        const [result] = await db.query('UPDATE vaksin SET nama_vaksin = ? WHERE id_vaksin = ?', [nama_vaksin, id_vaksin]);
        return result.affectedRows > 0;
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            throw new Error('Nama vaksin yang diperbarui sudah terdaftar.');
        }
        throw new Error(`Gagal memperbarui vaksin: ${error.message}`);
    }
};

/**
 * Menghapus jenis vaksin berdasarkan ID.
 * @param {number} id_vaksin - ID unik dari vaksin yang akan dihapus.
 * @returns {boolean} True jika penghapusan berhasil, false jika tidak ada vaksin dengan ID tersebut.
 */
ImunisasiModel.deleteVaksin = async (id_vaksin) => {
    const [result] = await db.query('DELETE FROM vaksin WHERE id_vaksin = ?', [id_vaksin]);
    return result.affectedRows > 0;
};


// Metode untuk Tabel IMUNISASI 

/**
 * Menambah catatan imunisasi baru untuk balita.
 * @param {object} dataImunisasi - Objek yang berisi data imunisasi (id_balita, id_vaksin, id_petugas, dokter, tanggal_diberikan).
 * @returns {object} Objek catatan imunisasi yang baru dibuat dengan id_imunisasi.
 * @throws {Error} Jika terjadi kesalahan database.
 */
ImunisasiModel.createImunisasi = async (dataImunisasi) => {
    const { id_balita, id_vaksin, id_petugas, dokter, tanggal_diberikan } = dataImunisasi;
    try {
        const [result] = await db.query(
            'INSERT INTO imunisasi (id_balita, id_vaksin, id_petugas, dokter, tanggal_diberikan) VALUES (?, ?, ?, ?, ?)',
            [id_balita, id_vaksin, id_petugas, dokter, tanggal_diberikan]
        );
        return { id_imunisasi: result.insertId, ...dataImunisasi };
    } catch (error) {
        throw new Error(`Gagal membuat catatan imunisasi: ${error.message}`);
    }
};

/**
 * Mengambil semua catatan imunisasi untuk balita tertentu.
 * Melakukan JOIN dengan tabel 'vaksin' untuk mendapatkan nama vaksin.
 * @param {number} id_balita - ID balita.
 * @returns {Array<object>} Array berisi catatan imunisasi balita tersebut.
 */
ImunisasiModel.findImunisasiByBalitaId = async (id_balita) => {
    const [rows] = await db.query(
        `SELECT i.*, v.nama_vaksin
         FROM imunisasi i
         JOIN vaksin v ON i.id_vaksin = v.id_vaksin
         WHERE i.id_balita = ?`,
        [id_balita]
    );
    return rows;
};

/**
 * Mengambil satu catatan imunisasi berdasarkan ID.
 * Melakukan JOIN dengan tabel 'vaksin' untuk mendapatkan nama vaksin.
 * @param {number} id_imunisasi - ID catatan imunisasi.
 * @returns {object|undefined} Objek catatan imunisasi jika ditemukan, atau undefined.
 */
ImunisasiModel.findImunisasiById = async (id_imunisasi) => {
    const [rows] = await db.query(
        `SELECT i.*, v.nama_vaksin
         FROM imunisasi i
         JOIN vaksin v ON i.id_vaksin = v.id_vaksin
         WHERE i.id_imunisasi = ?`,
        [id_imunisasi]
    );
    return rows[0];
};

/**
 * Memperbarui catatan imunisasi berdasarkan ID.
 * @param {number} id_imunisasi - ID catatan imunisasi yang akan diperbarui.
 * @param {object} dataImunisasi - Objek data imunisasi yang akan diperbarui.
 * @returns {boolean} True jika pembaruan berhasil, false jika tidak ada catatan dengan ID tersebut.
 */
ImunisasiModel.updateImunisasi = async (id_imunisasi, dataImunisasi) => {
    const { id_balita, id_vaksin, dokter, tanggal_diberikan } = dataImunisasi;
    // Note: id_petugas tidak diperbolehkan diupdate langsung melalui ini, karena seharusnya ditetapkan saat pembuatan.
    // Jika perlu diupdate, tambahkan ke sini atau buat method terpisah.
    const [result] = await db.query(
        'UPDATE imunisasi SET id_balita = ?, id_vaksin = ?, dokter = ?, tanggal_diberikan = ? WHERE id_imunisasi = ?',
        [id_balita, id_vaksin, dokter, tanggal_diberikan, id_imunisasi]
    );
    return result.affectedRows > 0;
};

/**
 * Menghapus catatan imunisasi berdasarkan ID.
 * @param {number} id_imunisasi - ID catatan imunisasi yang akan dihapus.
 * @returns {boolean} True jika penghapusan berhasil, false jika tidak ada catatan dengan ID tersebut.
 */
ImunisasiModel.deleteImunisasi = async (id_imunisasi) => {
    const [result] = await db.query('DELETE FROM imunisasi WHERE id_imunisasi = ?', [id_imunisasi]);
    return result.affectedRows > 0;
};

// Metode Pengecekan Kelengkapan Vaksin 
const VAKSIN_WAJIB = [
    'BCG',
    'Hepatitis B',
    'Polio',
    'DPT',
    'Hib',
    'Campak',
    'MMR',
    'Rotavirus'
];

/**
 * Mengecek apakah balita telah menerima semua vaksin wajib.
 * @param {number} id_balita - ID balita yang akan dicek.
 * @returns {object} Objek yang menunjukkan status kelengkapan dan daftar vaksin yang hilang (jika ada).
 */
ImunisasiModel.checkImunisasiCompletion = async (id_balita) => {
    const [receivedVaksins] = await db.query(
        `SELECT DISTINCT v.nama_vaksin
         FROM imunisasi i
         JOIN vaksin v ON i.id_vaksin = v.id_vaksin
         WHERE i.id_balita = ?`,
        [id_balita]
    );

    const receivedVaksinNames = receivedVaksins.map(v => v.nama_vaksin);
    const missingVaksins = VAKSIN_WAJIB.filter(wajib => !receivedVaksinNames.includes(wajib));

    if (missingVaksins.length === 0) {
        return { status: 'completed' };
    } else {
        return { status: 'incomplete', missing_vaksins: missingVaksins };
    }
};

module.exports = ImunisasiModel;
