-- Migration: Add order_number column for human-readable booking ID
-- Purpose: Store booking ID (e.g., BKG-A3F7M2) for easy search
-- Date: 2026-03-04

USE ragiltrans;

-- Add order_number column
ALTER TABLE sewa 
ADD COLUMN order_number VARCHAR(50) UNIQUE NULL AFTER id,
ADD INDEX idx_order_number (order_number);

-- Generate random order_number untuk existing bookings
-- Note: Run this script, then restart backend to use new random format

-- Function to generate random code (manual query for existing data)
-- Format: BKG-XXXXXX (6 random alphanumeric chars)
UPDATE sewa 
SET order_number = CONCAT('BKG-', 
  SUBSTRING(MD5(RAND()), 1, 6)
)
WHERE order_number IS NULL;

-- Make sure all are uppercase
UPDATE sewa 
SET order_number = UPPER(order_number)
WHERE order_number IS NOT NULL;

-- Verify
SELECT id, order_number, nama_customer, status 
FROM sewa 
ORDER BY id DESC 
LIMIT 10;
