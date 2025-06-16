const path = require('path');
const ejs = require('ejs');
const puppeteer = require('puppeteer'); // Ganti html-pdf dengan puppeteer
const SertifikatModel = require('../models/sertifikat.model');
const ApiService = require('../services/api.service');

exports.generateSertifikat = async (req, res) => {
    try {
        const { id_balita } = req.params;
        const authHeader = req.headers['authorization'];

        // 1. Cek status kelengkapan (tetap sama)
        const statusResult = await ApiService.checkImunisasiCompletion(id_balita, authHeader);
        if (statusResult.status !== 'completed') {
            return res.status(400).json({ message: 'Sertifikat belum bisa dibuat, imunisasi belum lengkap.' });
        }

        // 2. Ambil detail balita (tetap sama)
        const balita = await ApiService.getBalitaDetails(id_balita, authHeader);
        if (!balita) {
            return res.status(404).json({ message: 'Data balita tidak ditemukan.' });
        }

        // --- LOGIKA BARU MENGGUNAKAN PUPPETEER ---

        // // 3. Generate HTML dari template EJS
        // const templatePath = path.join(__dirname, '../views/sertifikat.ejs');
        // const html = await ejs.renderFile(templatePath, { balita });

        // // 4. Buat PDF menggunakan Puppeteer
        // const browser = await puppeteer.launch({ 
        //     executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
        //     args: [
        //       '--no-sandbox', 
        //       '--disable-setuid-sandbox',
        //       '--disable-dev-shm-usage'
        //     ], 
        //     protocolTimeout: 1200000
        // });

const browser = await puppeteer.launch({ 
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    headless: 'new', // Tambahkan ini
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',                    // Tambahkan
      '--disable-web-security',           // Tambahkan
      '--disable-background-timer-throttling' // Tambahkan
    ], 
    timeout: 30000,        // 30 detik (bukan 20 menit!)
    protocolTimeout: 60000 // 1 menit (bukan 20 menit!)
});

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
        await browser.close();

        // 5. Simpan URL ke DB dan kirim PDF ke user
        // Daripada menyimpan ke file, kita bisa langsung kirim PDF-nya
        const fileName = `sertifikat-${balita.nik_balita}.pdf`;

        // Simpan data sertifikat ke database Anda (opsional, jika masih perlu melacaknya)
        // await SertifikatModel.create(id_balita, `/api/sertifikat/download/${fileName}`); // Contoh URL

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        res.send(pdfBuffer); // Langsung kirim buffer PDF sebagai respon

    } catch (error) {
        console.error('Error generating sertifikat:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};