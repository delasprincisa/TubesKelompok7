// imunisasi-service/controllers/imunisasi.controller.js

const ImunisasiModel = require('../models/imunisasi.model'); 
const db = require('../config/database'); 

/**
 * Mengambil semua data jenis vaksin
 * Hanya bisa diakses oleh user dengan role 'petugas'
 * @param {object} req 
 * @param {object} res 
 */
exports.getAllVaksins = async (req, res) => {
    if (req.user.role !== 'petugas') {
        return res.status(403).json({ message: 'Akses ditolak: Hanya untuk petugas.' });
    }
    try {
        const vaksins = await ImunisasiModel.findAllVaksins();
        res.status(200).json(vaksins);
    } catch (error) {
        console.error('Error in getAllVaksins:', error);
        res.status(500).json({ message: 'Gagal mengambil data vaksin.', error: error.message });
    }
};

/**
 * Membuat data vaksin baru
 * Hanya bisa diakses oleh user dengan role 'petugas'
 * @param {object} req 
 * @param {object} res 
 */
exports.createVaksin = async (req, res) => {
    if (req.user.role !== 'petugas') {
        return res.status(403).json({ message: 'Akses ditolak: Hanya untuk petugas.' });
    }
    const { nama_vaksin } = req.body;
    if (!nama_vaksin) {
        return res.status(400).json({ message: 'Nama vaksin diperlukan.' });
    }
    try {
        const newVaksin = await ImunisasiModel.createVaksin(nama_vaksin);
        res.status(201).json({ message: 'Vaksin berhasil ditambahkan.', vaksin: newVaksin });
    } catch (error) {
        console.error('Error in createVaksin:', error);
        // Check for specific error message from model (e.g., duplicate entry)
        if (error.message.includes('Nama vaksin sudah terdaftar.')) {
            return res.status(409).json({ message: error.message });
        }
        res.status(500).json({ message: 'Gagal menambah vaksin.', error: error.message });
    }
};

/**
 * Memperbarui data vaksin berdasarkan ID
 * Hanya bisa diakses oleh user dengan role 'petugas'
 * @param {object} req 
 * @param {object} res 
 */
exports.updateVaksin = async (req, res) => {
    if (req.user.role !== 'petugas') {
        return res.status(403).json({ message: 'Akses ditolak: Hanya untuk petugas.' });
    }
    const { id } = req.params;
    const { nama_vaksin } = req.body;
    if (!nama_vaksin) {
        return res.status(400).json({ message: 'Nama vaksin diperlukan.' });
    }
    try {
        const updated = await ImunisasiModel.updateVaksin(id, nama_vaksin);
        if (!updated) {
            return res.status(404).json({ message: 'Vaksin tidak ditemukan.' });
        }
        res.status(200).json({ message: 'Vaksin berhasil diperbarui.' });
    } catch (error) {
        console.error('Error in updateVaksin:', error);
        if (error.message.includes('Nama vaksin yang diperbarui sudah terdaftar.')) {
            return res.status(409).json({ message: error.message });
        }
        res.status(500).json({ message: 'Gagal memperbarui vaksin.', error: error.message });
    }
};

/**
 * Menghapus data vaksin berdasarkan ID
 * Hanya bisa diakses oleh user dengan role 'petugas'
 * @param {object} req 
 * @param {object} res 
 */
exports.deleteVaksin = async (req, res) => {
    if (req.user.role !== 'petugas') {
        return res.status(403).json({ message: 'Akses ditolak: Hanya untuk petugas.' });
    }
    const { id } = req.params;
    try {
        const deleted = await ImunisasiModel.deleteVaksin(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Vaksin tidak ditemukan.' });
        }
        res.status(200).json({ message: 'Vaksin berhasil dihapus.' });
    } catch (error) {
        console.error('Error in deleteVaksin:', error);
        res.status(500).json({ message: 'Gagal menghapus vaksin.', error: error.message });
    }
};


/**
 * Menambahkan catatan imunisasi untuk balita
 * Hanya bisa diakses oleh user dengan role 'petugas'
 * id_petugas diambil dari token pengguna yang sedang login
 * @param {object} req 
 * @param {object} res 
 */
exports.createImunisasiRecord = async (req, res) => {
    if (req.user.role !== 'petugas') {
        return res.status(403).json({ message: 'Akses ditolak: Hanya untuk petugas.' });
    }
    const { id_balita, id_vaksin, dokter, tanggal_diberikan } = req.body;
    const id_petugas = req.user.id_user; // Get petugas ID dari auth user

    if (!id_balita || !id_vaksin || !tanggal_diberikan) {
        return res.status(400).json({ message: 'ID Balita, ID Vaksin, dan Tanggal Diberikan diperlukan.' });
    }

    try {
        const newRecord = await ImunisasiModel.createImunisasi({
            id_balita,
            id_vaksin,
            id_petugas,
            dokter,
            tanggal_diberikan,
        });
        res.status(201).json({ message: 'Catatan imunisasi berhasil ditambahkan.', record: newRecord });
    } catch (error) {
        console.error('Error in createImunisasiRecord:', error);
        res.status(500).json({ message: 'Gagal menambah catatan imunisasi.', error: error.message });
    }
};

/**
 * Mengambil semua catatan imunisasi berdasarkan ID balita
 * Bisa diakses oleh: 'petugas' (semua balita) 
 * @param {object} req 
 * @param {object} res 
 */
exports.getImunisasiRecordsByBalitaId = async (req, res) => {
    const { id_balita } = req.params;
    const userRole = req.user.role;
    const userNik = req.user.nik_user; // NIK user untuk 'orang_tua' role

    try {
        const [balitaResult] = await db.query('SELECT nik_ibu FROM balita WHERE id_balita = ?', [id_balita]);
        const balita = balitaResult[0];

        if (!balita) {
            return res.status(404).json({ message: 'Balita tidak ditemukan.' });
        }

        // Authorization check
        if (userRole === 'petugas' || userNik === balita.nik_ibu) {
            const records = await ImunisasiModel.findImunisasiByBalitaId(id_balita);
            return res.status(200).json(records);
        } else {
            return res.status(403).json({ message: 'Akses ditolak: Anda tidak memiliki akses ke data imunisasi balita ini.' });
        }

    } catch (error) {
        console.error('Error in getImunisasiRecordsByBalitaId:', error);
        res.status(500).json({ message: 'Gagal mengambil catatan imunisasi balita.', error: error.message });
    }
};


/**
 * Mengambil satu catatan imunisasi berdasarkan ID-nya.
 * Dapat diakses oleh 'petugas' (catatan apa pun) atau 'orang_tua' (hanya catatan untuk balita mereka sendiri).
 * @param {object} req 
 * @param {object} res 
 */
exports.getImunisasiRecordById = async (req, res) => {
    const { id_imunisasi } = req.params;
    const userRole = req.user.role;
    const userNik = req.user.nik_user;

    try {
        const record = await ImunisasiModel.findImunisasiById(id_imunisasi);
        if (!record) {
            return res.status(404).json({ message: 'Catatan imunisasi tidak ditemukan.' });
        }
        const [balitaResult] = await db.query('SELECT nik_ibu FROM balita WHERE id_balita = ?', [record.id_balita]);
        const balita = balitaResult[0];

        if (!balita) {
            return res.status(500).json({ message: 'Data balita terkait catatan imunisasi tidak ditemukan.' });
        }
        if (userRole === 'petugas' || userNik === balita.nik_ibu) {
            return res.status(200).json(record);
        } else {
            return res.status(403).json({ message: 'Akses ditolak: Anda tidak memiliki akses ke catatan imunisasi ini.' });
        }

    } catch (error) {
        console.error('Error in getImunisasiRecordById:', error);
        res.status(500).json({ message: 'Gagal mengambil catatan imunisasi.', error: error.message });
    }
};

/**
 * memperbarui catatan imunisasi yang ada.
 * Hanya dapat diakses melalui role 'petugas'.
 * @param {object} req 
 * @param {object} res 
 */
exports.updateImunisasiRecord = async (req, res) => {
    if (req.user.role !== 'petugas') {
        return res.status(403).json({ message: 'Akses ditolak: Hanya untuk petugas.' });
    }
    const { id_imunisasi } = req.params;
    const { id_balita, id_vaksin, dokter, tanggal_diberikan } = req.body;

    try {
        const updated = await ImunisasiModel.updateImunisasi(id_imunisasi, {
            id_balita,
            id_vaksin,
            dokter,
            tanggal_diberikan,
        });
        if (!updated) {
            return res.status(404).json({ message: 'Catatan imunisasi tidak ditemukan.' });
        }
        res.status(200).json({ message: 'Catatan imunisasi berhasil diperbarui.' });
    } catch (error) {
        console.error('Error in updateImunisasiRecord:', error);
        res.status(500).json({ message: 'Gagal memperbarui catatan imunisasi.', error: error.message });
    }
};

/**
 * Menghapus catatan imunisasi berdasarkan ID
 * Hanya bisa diakses oleh user dengan role 'petugas'
 * @param {object} req 
 * @param {object} res 
 */
exports.deleteImunisasiRecord = async (req, res) => {

    if (req.user.role !== 'petugas') {
        return res.status(403).json({ message: 'Akses ditolak: Hanya untuk petugas.' });
    }
    const { id_imunisasi } = req.params;
    try {
        const deleted = await ImunisasiModel.deleteImunisasi(id_imunisasi);
        if (!deleted) {
            return res.status(404).json({ message: 'Catatan imunisasi tidak ditemukan.' });
        }
        res.status(200).json({ message: 'Catatan imunisasi berhasil dihapus.' });
    } catch (error) {
        console.error('Error in deleteImunisasiRecord:', error);
        res.status(500).json({ message: 'Gagal menghapus catatan imunisasi.', error: error.message });
    }
};

// --- Endpoint untuk mengecek apakah imunisasi balita sudah lengkap ---

/**
 * Mengecek apakah imunisasi balita sudah lengkap
 * Bisa diakses oleh: 'petugas' (semua balita) , 'orang_tua' (hanya balita miliknya)
 * @param {object} req 
 * @param {object} res 
 */
exports.checkImunisasiCompletion = async (req, res) => {
    const { id_balita } = req.params;
    const userRole = req.user.role;
    const userNik = req.user.nik_user;

    try {
        const [balitaResult] = await db.query('SELECT nik_ibu FROM balita WHERE id_balita = ?', [id_balita]);
        const balita = balitaResult[0];

        if (!balita) {
            return res.status(404).json({ message: 'Balita tidak ditemukan.' });
        }
        if (userRole === 'petugas' || userNik === balita.nik_ibu) {
            const completionStatus = await ImunisasiModel.checkImunisasiCompletion(id_balita);
        // jika completionStatus adalah 'completed',
            //  Jika sudah lengkap, seharusnya memicu Sertifikat Service
            res.status(200).json(completionStatus);
        } else {
            return res.status(403).json({ message: 'Akses ditolak: Anda tidak memiliki akses untuk mengecek status imunisasi balita ini.' });
        }
    } catch (error) {
        console.error('Error in checkImunisasiCompletion:', error);
        res.status(500).json({ message: 'Gagal mengecek kelengkapan imunisasi.', error: error.message });
    }
};
