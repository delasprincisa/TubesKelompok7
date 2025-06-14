USE imunisasi_db;

CREATE TABLE `user` (
  `id_user` INT NOT NULL AUTO_INCREMENT,
  `nik_user` VARCHAR(16) NOT NULL,
  `nama_user` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('petugas', 'orang_tua') NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_user`),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC),
  UNIQUE INDEX `nik_user_UNIQUE` (`nik_user` ASC)
);

CREATE TABLE `balita` (
  `id_balita` INT NOT NULL AUTO_INCREMENT,
  `nik_balita` VARCHAR(16) NOT NULL,
  `nama_balita` VARCHAR(255) NOT NULL,
  `jenis_kelamin` ENUM('L', 'P') NOT NULL,
  `tempat_lahir` VARCHAR(100) NOT NULL,
  `tanggal_lahir` DATE NOT NULL,
  `alamat` TEXT NULL,
  `nama_ibu` VARCHAR(255) NOT NULL,
  `nik_ibu` VARCHAR(16) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_balita`),
  UNIQUE INDEX `nik_balita_UNIQUE` (`nik_balita` ASC),
  INDEX `fk_balita_user_idx` (`nik_ibu` ASC),
  CONSTRAINT `fk_balita_user`
    FOREIGN KEY (`nik_ibu`)
    REFERENCES `user` (`nik_user`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
);

CREATE TABLE `vaksin` (
  `id_vaksin` INT NOT NULL AUTO_INCREMENT,
  `nama_vaksin` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id_vaksin`),
  UNIQUE INDEX `nama_vaksin_UNIQUE` (`nama_vaksin`)
);

CREATE TABLE `imunisasi` (
  `id_imunisasi` INT NOT NULL AUTO_INCREMENT,
  `id_balita` INT NOT NULL,
  `id_vaksin` INT NOT NULL,
  `id_petugas` INT NOT NULL,
  `dokter` VARCHAR(255) NULL,
  `tanggal_diberikan` DATE NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_imunisasi`),
  INDEX `fk_imunisasi_balita_idx` (`id_balita` ASC),
  INDEX `fk_imunisasi_vaksin_idx` (`id_vaksin` ASC),
  INDEX `fk_imunisasi_petugas_idx` (`id_petugas` ASC),
  CONSTRAINT `fk_imunisasi_balita` FOREIGN KEY (`id_balita`) REFERENCES `balita` (`id_balita`),
  CONSTRAINT `fk_imunisasi_vaksin` FOREIGN KEY (`id_vaksin`) REFERENCES `vaksin` (`id_vaksin`),
  CONSTRAINT `fk_imunisasi_petugas` FOREIGN KEY (`id_petugas`) REFERENCES `user` (`id_user`)
);


INSERT INTO `vaksin` (`nama_vaksin`) VALUES
('BCG'), ('Hepatitis B'), ('Polio'), ('DPT'),
('Hib'), ('Campak'), ('MMR'), ('Rotavirus');

CREATE TABLE `sertifikat` (
  `id_sertifikat` INT NOT NULL AUTO_INCREMENT,
  `id_balita` INT NOT NULL,
  `url` VARCHAR(255) NOT NULL,
  `tanggal_dibuat` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_sertifikat`),
  FOREIGN KEY (`id_balita`) REFERENCES `balita` (`id_balita`)
);
