const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 menit
  max: 10, // maksimal 10 request per IP
  message: {
    status: 429,
    message: 'Terlalu banyak permintaan. Silakan coba lagi dalam satu menit.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = limiter;