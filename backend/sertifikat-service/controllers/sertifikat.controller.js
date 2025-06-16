const path = require('path');
const ejs = require('ejs');
const puppeteer = require('puppeteer');
const SertifikatModel = require('../models/sertifikat.model');
const ApiService = require('../services/api.service');

exports.generateSertifikat = async (req, res) => {
    try {
        const { id_balita } = req.params;
        const authHeader = req.headers['authorization'];

        // 1. Cek status kelengkapan
        const statusResult = await ApiService.checkImunisasiCompletion(id_balita, authHeader);
        if (statusResult.status !== 'completed') {
            return res.status(400).json({ message: 'Sertifikat belum bisa dibuat, imunisasi belum lengkap.' });
        }

        // 2. Ambil detail balita
        const balita = await ApiService.getBalitaDetails(id_balita, authHeader);
        if (!balita) {
            return res.status(404).json({ message: 'Data balita tidak ditemukan.' });
        }

        // 3. Generate HTML dari template EJS (Dikembalikan ke dalam fungsi ini)
        const templatePath = path.join(__dirname, '../views/sertifikat.ejs');
        const html = await ejs.renderFile(templatePath, { balita });

        // 4. Buat PDF menggunakan Puppeteer
        const browser = await puppeteer.launch({ 
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
            headless: 'new',
            args: [
              '--no-sandbox', 
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-gpu'
            ], 
            timeout: 60000 // Timeout 60 detik
        });
        
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
        await browser.close();

        // 5. Kirim PDF ke user
        const fileName = `sertifikat-${balita.nik_balita}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        res.send(pdfBuffer);

    } catch (error) {
        console.error('Error generating sertifikat:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
    }
};