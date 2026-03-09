-- Cleanup: Hapus kolom yang redundant
-- bank_tujuan → sudah ada payment_bank yang lebih akurat (diisi saat user hit Midtrans)
-- metode_pembayaran → sudah ada payment_method yang lebih detail (dari Midtrans response)

-- Hapus kolom bank_tujuan dari table sewa
ALTER TABLE sewa DROP COLUMN bank_tujuan;

-- Hapus kolom metode_pembayaran dari table sewa
ALTER TABLE sewa DROP COLUMN metode_pembayaran;

-- Verify struktur terbaru
DESCRIBE sewa;
