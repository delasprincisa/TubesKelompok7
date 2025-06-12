const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool(process.env.DATABASE_URL);

// Fungsi untuk mengetes koneksi
async function testConnection() {
  try {
    await pool.query('SELECT 1');
    console.log('Koneksi ke database MySQL berhasil.');
  } catch (error) {
    console.error('Gagal terhubung ke database:', error);
  }
}

testConnection();

module.exports = pool;