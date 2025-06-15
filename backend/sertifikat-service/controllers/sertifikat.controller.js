const path = require('path');
const ejs = require('ejs');
const puppeteer = require('puppeteer');
const db = require('../config/database');
const { checkImunisasiStatus, getBalitaDetails } = require('../models/sertifikat.model');

exports.generateSertifikat = async (req, res) => {
  try {
    const { id_balita } = req.params;

    // 1. Cek status imunisasi
    const statusResult = await checkImunisasiStatus(id_balita);
    if (statusResult.status !== 'completed') {
      return res.status(400).json({
        message: 'Mohon maaf, sertifikat tidak dapat diunduh karena vaksin belum lengkap.'
      });
    }

    // 2. Ambil detail balita
    const balita = await getBalitaDetails(id_balita);
    if (!balita) {
      return res.status(404).json({ message: 'Data balita tidak ditemukan.' });
    }

    // 3. Render HTML dari template EJS
    const templatePath = path.join(__dirname, '../views/sertifikat.ejs');
    const html = await ejs.renderFile(templatePath, { balita });

    // 4. Lokasi penyimpanan PDF
    const fileName = `sertifikat-${balita.nik_balita}.pdf`;
    const pdfPath = path.join(__dirname, `../public/certificates/${fileName}`);
    const fileUrl = `/certificates/${fileName}`;

    // 5. Generate PDF pakai Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true
    });

    await browser.close();

    // 6. Simpan URL ke tabel sertifikat
    await db.query(
    `INSERT INTO sertifikat (id_balita, nik_ibu, url) VALUES (?, ?, ?)`,
    [balita.id_balita, balita.nik_ibu, fileUrl]
    );

    return res.status(200).json({ message: 'Sertifikat berhasil dibuat.', url: fileUrl });
  } catch (error) {
    console.error('Error generating sertifikat:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error });
  }
};