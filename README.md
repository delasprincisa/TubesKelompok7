# Sistem Manajemen Imunisasi & Sertifikat Digital (Microservices)

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) ![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white) ![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white) ![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white) ![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

Ini adalah Proyek Akhir untuk mata kuliah Service Oriented Software Development (SOSD), yang mengimplementasikan sebuah sistem manajemen data imunisasi balita menggunakan **Arsitektur Microservices**.

## 📝 Deskripsi Proyek

Proyek ini bertujuan untuk mendigitalisasi proses pencatatan imunisasi yang seringkali masih manual. Sistem ini menyediakan platform terpusat bagi petugas kesehatan untuk mengelola data balita dan riwayat vaksinasinya, serta memberikan akses kepada orang tua untuk melihat data tersebut dan mengunduh sertifikat imunisasi digital secara otomatis ketika semua vaksinasi wajib telah terpenuhi.

## ✨ Fitur Utama

-   **Manajemen Data**: Fungsionalitas CRUD penuh untuk data Pengguna, Balita, dan Imunisasi.
-   **Otentikasi & Otorisasi**: Sistem login aman menggunakan **JWT** dengan dua level akses: `petugas` (admin) dan `orang_tua` (user).
-   **Sertifikat Digital**: Pembuatan sertifikat PDF secara otomatis dan *on-demand* saat 8 vaksinasi wajib telah lengkap.
-   **Arsitektur Microservices**: Sistem dipecah menjadi beberapa layanan independen untuk skalabilitas dan kemudahan pemeliharaan.
-   **Siap untuk Production**: Setiap layanan di-*containerize* dengan **Docker** dan siap untuk diorkestrasi oleh **Kubernetes**.

## 🏗️ Arsitektur Sistem

Sistem ini terdiri dari beberapa layanan mikro yang masing-masing memiliki satu tanggung jawab spesifik:

1.  **API Gateway**: Pintu gerbang utama untuk semua permintaan dari klien. Bertanggung jawab atas *routing* dan validasi awal.
2.  **Auth Service**: Menangani semua logika terkait registrasi dan login pengguna, serta penerbitan token JWT.
3.  **Balita Service**: Mengelola data master balita.
4.  **Imunisasi Service**: Mengelola data master vaksin dan mencatat riwayat imunisasi.
5.  **Sertifikat Service**: Menghasilkan file PDF sertifikat setelah imunisasi lengkap.

Semua layanan ini berjalan sebagai container Docker dan berkomunikasi satu sama lain melalui jaringan internal yang dikelola oleh Docker Compose (untuk pengembangan) atau Kubernetes (untuk deployment).

## 🛠️ Teknologi yang Digunakan

-   **Backend**: Node.js, Express.js
-   **Database**: MySQL (atau PostgreSQL)
-   **Containerization**: Docker, Docker Compose
-   **Orkestrasi**: Kubernetes
-   **Keamanan**: JSON Web Token (JWT), bcryptjs
-   **Lainnya**: Puppeteer (untuk PDF), EJS, Axios (untuk komunikasi antar-service)

## 🚀 Panduan Setup (Pengembangan Lokal)

Berikut adalah cara untuk menjalankan proyek ini di komputer lokal Anda.

### Prasyarat

-   [Node.js](https://nodejs.org/) (v18+)
-   [Docker](https://www.docker.com/products/docker-desktop/) & Docker Compose
-   Git

### Langkah-langkah Instalasi

1.  **Clone repository ini:**
    ```bash
    git clone [https://github.com/uasfighterr/TubesKelompok7.git](https://github.com/uasfighterr/TubesKelompok7.git)
    cd TubesKelompok7
    ```

2.  **Konfigurasi Environment (`.env`)**
    Setiap folder layanan (misal: `auth-service`, `balita-service`, dll.) memiliki file `.env.example`. Salin file tersebut dan ganti namanya menjadi `.env`. Sesuaikan isinya jika perlu (meskipun konfigurasi default sudah dirancang untuk berjalan dengan Docker Compose).

3.  **Install Dependencies untuk setiap layanan**
    Jalankan `npm install` di dalam setiap folder layanan untuk mengunduh library yang dibutuhkan.
    ```bash
    cd auth-service
    npm install
    cd ../balita-service
    npm install
    cd .. 
    # Ulangi untuk semua layanan
    ```

4.  **Jalankan dengan Docker Compose**
    Pastikan Anda berada di direktori utama proyek (`TubesKelompok7`), lalu jalankan:
    ```bash
    docker-compose up --build -d
    ```
    Perintah ini akan membangun dan menjalankan semua container layanan secara otomatis.

5.  **Inisialisasi Database (Hanya untuk pertama kali)**
    -   Setelah semua container berjalan, buka aplikasi database Anda (DBeaver, TablePlus).
    -   Buat koneksi baru ke MySQL dengan detail:
        -   **Host**: `localhost`
        -   **Port**: `3306` (atau `3307` jika Anda mengubahnya)
        -   **User**: `root`
        -   **Password**: (kosongkan)
    -   Buka file `mysql-init/init.sql`, salin seluruh isinya, dan jalankan sebagai query di database `imunisasi_db` untuk membuat semua tabel.

Proyek Anda sekarang berjalan! Anda bisa mulai melakukan pengujian API menggunakan Postman.

## 👥 Kontribusi Tim

-   **Ketua Tim, Arsitektur Sistem, Auth Service**: Delas 
-   **Analisis & Imunisasi Service**: Diva
-   **Balita Service**: Chintia
-   **Sertifikat Service**: Rafa
-   **Frontend**: Rangga
