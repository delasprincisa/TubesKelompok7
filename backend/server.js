const express = require('express');
const app = express();
const PORT = 3011;
const cors = require('cors');

app.use(cors());

app.get('/api', (req, res) => {
    res.json({ message: 'tes backend di kubernetes' });
});

app.listen(PORT, () => console.log(`Server jalan pada port ${PORT}`));