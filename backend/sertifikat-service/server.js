const express = require('express');
const app = express();
const path = require('path');
const sertifikatRoute = require('./routes/sertifikat.route');

app.use(express.json());
app.use('/certificates', express.static(path.join(__dirname, 'public/certificates')));
app.use('/sertifikat', sertifikatRoute);

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
