const Balita = require('../models/balita.model');

// Hanya bisa diakses oleh petugas
exports.createBalita = async (req, res) => {
  if (req.user.role !== 'petugas') {
    return res.status(403).json({ message: 'Akses ditolak: hanya untuk petugas' });
  }
  try {
    const balita = await Balita.create(req.body);
    res.status(201).json(balita);
  } catch (error) {
    res.status(500).json({ message: 'Gagal membuat data balita', error: error.message });
  }
};

// Bisa diakses petugas atau orang tua yang bersangkutan
exports.getBalitaById = async (req, res) => {
  try {
    const balita = await Balita.findById(req.params.id_balita);
    if (!balita) {
      return res.status(404).json({ message: 'Data balita tidak ditemukan' });
    }

    // Otorisasi: Cek apakah user adalah petugas ATAU orang tua dari balita ini
    if (req.user.role === 'petugas' || req.user.nik_user === balita.nik_ibu) {
      return res.status(200).json(balita);
    } else {
      return res.status(403).json({ message: 'Akses ditolak' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data balita', error: error.message });
  }
};