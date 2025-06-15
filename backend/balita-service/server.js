const express = require('express');
const dotenv = require('dotenv');
const balitaRoutes = require('./routes/balita.routes');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());
//app.use('/', balitaRoutes);
app.use('/balita', balitaRoutes);

app.listen(PORT, () => {
  console.log(`Balita Service berjalan pada port ${PORT}`);
});