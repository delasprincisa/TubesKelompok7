const router = express.Router();
const { generateSertifikat } = require('../controllers/sertifikat.controller');

router.get('/:id_balita', generateSertifikat);

module.exports = router;
