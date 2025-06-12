const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { nama_user, nik_user, email, password } = req.body;
  const role = 'orang_tua';

  try {
    const [nikExists] = await db.query('SELECT nik_user FROM user WHERE nik_user = ?', [nik_user]);
    if (nikExists.length > 0) {
      return res.status(409).json({ message: 'NIK sudah terdaftar' });
    }
    const [userExists] = await db.query('SELECT email FROM user WHERE email = ?', [email]);
    if (userExists.length > 0) {
      return res.status(409).json({ message: 'Email sudah terdaftar' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [newUser] = await db.query(
      'INSERT INTO user (nama_user, nik_user, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [nama_user, nik_user, email, hashedPassword, role]
    );

    res.status(201).json({
      message: 'Registrasi berhasil',
      id_user: newUser.insertId,
    });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await db.query('SELECT * FROM user WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const payload = {
      id_user: user.id_user,
      nik_user: user.nik_user,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(200).json({ message: 'Login berhasil', token });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
  }
};