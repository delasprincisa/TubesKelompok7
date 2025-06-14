// imunisasi-service/routes/imunisasi.routes.js

const express = require('express');
const router = express.Router();
const imunisasiController = require('../controllers/imunisasi.controller'); 
const verifyToken = require('../middlewares/auth.middleware');             

router.use(verifyToken);

// Rute untuk Manajemen Vaksin (Data Master) 
router.get('/vaksins', imunisasiController.getAllVaksins);
router.post('/vaksins', imunisasiController.createVaksin);
router.put('/vaksins/:id', imunisasiController.updateVaksin);
router.delete('/vaksins/:id', imunisasiController.deleteVaksin);

// Rute untuk Manajemen Catatan Imunisasi 
router.post('/records', imunisasiController.createImunisasiRecord); // Catat imunisasi Balita role "petugas"
router.get('/records/balita/:id_balita', imunisasiController.getImunisasiRecordsByBalitaId); // get records imunisasi berdasrkan id_balita role "petugas dan ortu"
router.get('/records/:id_imunisasi', imunisasiController.getImunisasiRecordById); // get records imunisasi berdasarkan id_imunisasi role "petugas dan ortu"
router.put('/records/:id_imunisasi', imunisasiController.updateImunisasiRecord); // 
router.delete('/records/:id_imunisasi', imunisasiController.deleteImunisasiRecord);

// Rute untuk Pengecekan Kelengkapan Vaksin
router.get('/check-completion/:id_balita', imunisasiController.checkImunisasiCompletion);

module.exports = router;
