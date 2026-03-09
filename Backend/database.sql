-- Buat database
CREATE DATABASE IF NOT EXISTS ragiltrans;
USE ragiltrans;

-- Tabel users untuk registrasi/login user biasa
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nama VARCHAR(100) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  no_hp VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel admin untuk login admin
CREATE TABLE IF NOT EXISTS admin (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel mobil untuk data mobil
-- Individual Unit Tracking: Each record = 1 physical vehicle with unique plate number
-- stok field always = 1 (managed automatically by backend)
CREATE TABLE IF NOT EXISTS mobil (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nama_mobil VARCHAR(100) NOT NULL,
  plat_nomor VARCHAR(20) NOT NULL UNIQUE,
  kapasitas_penumpang INT NOT NULL,
  jenis_transmisi VARCHAR(20) NOT NULL,
  jenis_bahan_bakar VARCHAR(20) NOT NULL DEFAULT 'Bensin',
  harga_per_hari DECIMAL(10, 2) NOT NULL,
  stok INT NOT NULL DEFAULT 1, -- Always 1 (individual unit)
  status VARCHAR(20) DEFAULT 'tersedia',
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel sewa untuk pemesanan (mendukung guest booking)
CREATE TABLE IF NOT EXISTS sewa (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_number VARCHAR(50) UNIQUE NULL,
  user_id INT NULL,
  mobil_id INT NOT NULL,
  nama_customer VARCHAR(100),
  email VARCHAR(100),
  no_hp VARCHAR(20),
  nama_ktp VARCHAR(100),
  nik VARCHAR(16),
  foto_ktp VARCHAR(255),
  tanggal_pinjam DATE NOT NULL,
  jam_pinjam TIME,
  tanggal_selesai DATE NOT NULL,
  jam_selesai TIME,
  dengan_driver VARCHAR(10) DEFAULT 'tidak',
  biaya_driver DECIMAL(10, 2) DEFAULT 0,
  jenis_layanan VARCHAR(50),
  harga_per_hari DECIMAL(10, 2) NOT NULL,
  durasi_hari INT NOT NULL,
  total_harga DECIMAL(10, 2) NOT NULL,
  -- dp_dibayar DECIMAL(10, 2) DEFAULT 0,  -- Removed: No DP system, full payment only
  -- sisa_pembayaran DECIMAL(10, 2) DEFAULT 0,  -- Removed: No DP system, full payment only
  metode_pembayaran VARCHAR(50),
  bank_tujuan VARCHAR(50),
  catatan TEXT,
  midtrans_order_id VARCHAR(100) NULL,
  midtrans_transaction_id VARCHAR(100) NULL,
  payment_status VARCHAR(50) NULL,
  payment_method VARCHAR(50) NULL,
  status VARCHAR(50) DEFAULT 'menunggu_pembayaran',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (mobil_id) REFERENCES mobil(id) ON DELETE CASCADE,
  INDEX idx_order_number (order_number),
  INDEX idx_midtrans_order_id (midtrans_order_id),
  INDEX idx_payment_status (payment_status)
);

-- Tabel verifikasi_ktp untuk verifikasi identitas
CREATE TABLE IF NOT EXISTS verifikasi_ktp (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  nik_input VARCHAR(16) NOT NULL,
  nik_ocr VARCHAR(16),
  foto_ktp VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending',
  verified_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabel payments untuk pembayaran
CREATE TABLE IF NOT EXISTS payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  booking_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'pending',
  transaction_id VARCHAR(100),
  paid_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES sewa(id) ON DELETE CASCADE
);

-- Insert admin default akan dibuat via script createAdmin.js
-- Jangan insert langsung karena password perlu di-hash dengan bcrypt
