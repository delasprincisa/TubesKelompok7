const express = require('express');
const router = express.Router();
const sertifikatController = require('../controllers/sertifikat.controller');
const verifyToken = require('../middlewares/auth.middleware');

router.get('/generate/:id_balita', verifyToken, sertifikatController.generateSertifikat);

module.exports = router;