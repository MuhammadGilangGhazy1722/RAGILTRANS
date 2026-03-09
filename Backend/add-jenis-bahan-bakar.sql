-- Migration: Add jenis_bahan_bakar column to mobil table
-- Date: 2026-03-04

USE ragiltrans;

-- Add jenis_bahan_bakar column to mobil table
ALTER TABLE mobil 
ADD COLUMN jenis_bahan_bakar VARCHAR(20) NOT NULL DEFAULT 'Bensin' 
AFTER jenis_transmisi;

-- Disable safe update mode temporarily
SET SQL_SAFE_UPDATES = 0;

-- Update existing records with default value
UPDATE mobil SET jenis_bahan_bakar = 'Bensin' WHERE jenis_bahan_bakar IS NULL OR jenis_bahan_bakar = '';

-- Re-enable safe update mode
SET SQL_SAFE_UPDATES = 1;

-- Verify the migration
SELECT id, nama_mobil, jenis_transmisi, jenis_bahan_bakar FROM mobil;
