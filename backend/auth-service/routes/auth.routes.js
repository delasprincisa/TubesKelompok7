// backend/auth-service/routes/auth.routes.js
const express = require('express');
const router = express.Router(); // Menginisialisasi Express Router
const authController = require('../controllers/auth.controller'); // Mengimpor controller otentikasi

// Rute untuk registrasi user baru
// Endpoint: POST /auth/register
router.post('/register', authController.register);

// Rute untuk login user
// Endpoint: POST /auth/login
router.post('/login', authController.login);

module.exports = router; // Mengekspor router agar bisa digunakan di server.js
