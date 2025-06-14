const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const pdf = require('html-pdf');
const db = require('../config/database');
const { checkImunisasiStatus, getBalitaDetails } = require('../models/sertifikat.model');

exports.generateSertifikat = async (req, res) => {
  try {
    const { id_balita } = req.params;

    const statusResult = await checkImunisasiStatus(id_balita);
    if (statusResult.status !== 'completed') {
      return res.status(400).json({
        message: 'Mohon maaf, sertifikat tidak dapat diunduh karena vaksin belum lengkap.'
      });
    }

    const balita = await getBalitaDetails(id_balita);
    if (!balita) {
      return res.status(404).json({ message: 'Data balita tidak ditemukan.' });
    }

    const templatePath = path.join(__dirname, '../views/sertifikat.ejs');
    const html = await ejs.renderFile(templatePath, { balita });

    const fileName = `sertifikat-${balita.nik_balita}.pdf`;
    const pdfPath = path.join(__dirname, `../public/certificates/${fileName}`);

    pdf.create(html).toFile(pdfPath, async (err, result) => {
      if (err) return res.status(500).json({ message: 'Gagal membuat PDF', error: err });

      const fileUrl = `/certificates/${fileName}`;
      await db.query(`UPDATE balita SET sertifikat_url = ? WHERE id_balita = ?`, [fileUrl, id_balita]);

      return res.status(200).json({ message: 'Sertifikat berhasil dibuat.', url: fileUrl });
    });
  } catch (error) {
    console.error('Error generating sertifikat:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error });
  }
};
