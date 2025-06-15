const axios = require('axios');

// Fungsi untuk bertanya ke imunisasi-service
exports.checkImunisasiCompletion = async (id_balita, token) => {
    const response = await axios.get(`${process.env.IMUNISASI_SERVICE_URL}/imunisasi/check-completion/${id_balita}`, {
        headers: { Authorization: token }
    });
    return response.data;
};

// Fungsi untuk bertanya ke balita-service
exports.getBalitaDetails = async (id_balita, token) => {
    const response = await axios.get(`${process.env.BALITA_SERVICE_URL}/balita/${id_balita}`, {
        headers: { Authorization: token }
    });
    return response.data;
};