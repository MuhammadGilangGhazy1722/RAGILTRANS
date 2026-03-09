-- Tambah kolom untuk tracking bank yang dipilih user saat payment
ALTER TABLE sewa 
ADD COLUMN payment_bank VARCHAR(50) DEFAULT NULL COMMENT 'Bank yang dipilih user (bca, bni, mandiri, bri, bsi, cimb)' 
AFTER payment_method;

-- Lihat struktur terbaru
DESCRIBE sewa;
