require('dotenv').config();
const express = require('express');
const path = require('path');
const sertifikatRoutes = require('./routes/sertifikat.route');

const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());

// Membuat folder 'public' bisa diakses secara statis
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', sertifikatRoutes);

app.listen(PORT, () => {
    console.log(`Sertifikat Service berjalan pada port ${PORT}`);
});