-- Migration: Convert to Individual Unit Tracking
-- Each car record represents ONE physical vehicle with unique plate number
-- Date: 2026-03-04

USE ragiltrans;

-- Update all existing cars to have stok = 1 (individual unit)
SET SQL_SAFE_UPDATES = 0;
UPDATE mobil SET stok = 1;
SET SQL_SAFE_UPDATES = 1;

-- Verify all cars now have stok = 1
SELECT id, nama_mobil, plat_nomor, stok FROM mobil;
