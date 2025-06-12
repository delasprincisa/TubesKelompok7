const express = require('express');
const router = express.Router();
const balitaController = require('../controllers/balita.controller');
const verifyToken = require('../middlewares/auth.middleware');

// Semua rute di bawah ini akan dilindungi oleh middleware verifikasi token
router.use(verifyToken);

router.post('/', balitaController.createBalita);
router.get('/:id_balita', balitaController.getBalitaById);

module.exports = router;