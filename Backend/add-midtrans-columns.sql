-- Migration: Add Midtrans Payment Gateway columns to sewa table

-- Add Midtrans payment columns
ALTER TABLE sewa 
ADD COLUMN midtrans_order_id VARCHAR(100) NULL AFTER catatan,
ADD COLUMN midtrans_snap_token TEXT NULL AFTER midtrans_order_id,
ADD COLUMN midtrans_transaction_id VARCHAR(100) NULL AFTER midtrans_snap_token,
ADD COLUMN payment_status VARCHAR(50) NULL AFTER midtrans_transaction_id,
ADD COLUMN payment_method VARCHAR(50) NULL AFTER payment_status;

-- Add index untuk faster lookup
ALTER TABLE sewa ADD INDEX idx_midtrans_order_id (midtrans_order_id);
ALTER TABLE sewa ADD INDEX idx_payment_status (payment_status);

-- Update status enum jika diperlukan (opsional, sesuaikan dengan kebutuhan)
-- Pastikan status bisa menampung nilai baru: 'menunggu_pembayaran', 'menunggu_persetujuan', 'disetujui', 'dibatalkan', 'selesai'

SELECT 'Migration completed! Midtrans columns added successfully.' AS status;
