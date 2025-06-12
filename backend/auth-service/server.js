const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth.routes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Auth Service is running!');
});

app.use('/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Auth Service berjalan pada port ${PORT}`);
});