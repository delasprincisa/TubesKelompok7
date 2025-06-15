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

//Bisa diakses petugas atau orang tua yang bersangkutan
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

exports.getBalitaByNikIbu = async (req, res) => {
  const nik_ibu = req.params.nik_ibu;

  // Hanya petugas atau ibu itu sendiri yang bisa akses
  if (req.user.role !== 'petugas' && req.user.nik_user !== nik_ibu) {
    return res.status(403).json({ message: 'Akses ditolak' });
  }

  try {
    const data = await Balita.findByNikIbu(nik_ibu);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data balita', error: error.message });
  }
};



exports.getAllBalita = async (req, res) => {
  if (req.user.role !== 'petugas') {
    return res.status(403).json({ message: 'Akses ditolak: hanya untuk petugas' });
  }
  try {
    const data = await Balita.findAll();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data balita', error: error.message });
  }
};

exports.updateBalita = async (req, res) => {
  try {
    const existing = await Balita.findById(req.params.id_balita);
    if (!existing) return res.status(404).json({ message: 'Data tidak ditemukan' });

    if (req.user.role !== 'petugas') {
      return res.status(403).json({ message: 'Akses ditolak: hanya untuk petugas' });
    }

    const updated = await Balita.update(req.params.id_balita, req.body);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengupdate data balita', error: error.message });
  }
};

exports.deleteBalita = async (req, res) => {
  try {
    const existing = await Balita.findById(req.params.id_balita);
    if (!existing) return res.status(404).json({ message: 'Data tidak ditemukan' });

    if (req.user.role !== 'petugas') {
      return res.status(403).json({ message: 'Akses ditolak: hanya untuk petugas' });
    }

    await Balita.delete(req.params.id_balita);
    res.json({ message: 'Data berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus data balita', error: error.message });
  }
};