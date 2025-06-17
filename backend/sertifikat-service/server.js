require("dotenv").config();
const express = require("express");
const path = require("path");
const sertifikatRoutes = require("./routes/sertifikat.route");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

// Membuat folder 'public' bisa diakses secara statis
app.use(express.static(path.join(__dirname, "public")));

app.use("/", sertifikatRoutes);

const server = app.listen(PORT, () => {
  console.log(`Sertifikat Service berjalan pada port ${PORT}`);
});

server.setTimeout(60000);
