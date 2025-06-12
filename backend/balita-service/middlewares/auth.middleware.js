const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(403).json({ message: 'Token tidak disediakan' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token tidak valid' });
    }
    req.user = decoded; // Menyimpan payload token ke request
    next();
  });
};

module.exports = verifyToken;