// imunisasi-service/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); 
const imunisasiRoutes = require('./routes/imunisasi.routes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Imunisasi Service is running!');
});


app.use('/imunisasi', imunisasiRoutes);

app.use((err, req, res, next) => {
    console.error('Global Error Handler:', err.stack);
    res.status(err.statusCode || 500).json({
        message: err.message || 'Terjadi kesalahan pada server',
        // Tampilkan detail error hanya di lingkungan non-produksi untuk keamanan
        error: process.env.NODE_ENV === 'production' ? {} : err.message
    });
});


// Menjalankan server pada port yang ditentukan
app.listen(PORT, () => {
    console.log(`Imunisasi Service berjalan pada port ${PORT}`);
});
