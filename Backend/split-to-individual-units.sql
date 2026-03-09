-- =====================================================
-- MIGRATION: Split Multi-Stock Cars to Individual Units
-- Date: 2026-03-08
-- Purpose: Convert stok > 1 to multiple rows (1 row = 1 physical vehicle)
-- =====================================================

-- Step 1: INSERT additional units for cars with stok > 1
-- Pattern: Keep original ID, add new rows for extra units with incremented plat nomor

-- ID 8: Isuzu Phanter (stok 2 → need +1 unit)
INSERT INTO mobil (nama_mobil, plat_nomor, kapasitas_penumpang, jenis_transmisi, jenis_bahan_bakar, harga_per_hari, stok, status, image_url)
SELECT 
    nama_mobil,
    'R 1235 RT' as plat_nomor,  -- Increment plat nomor
    kapasitas_penumpang,
    jenis_transmisi,
    jenis_bahan_bakar,
    harga_per_hari,
    1 as stok,  -- Always 1 for individual unit
    status,
    image_url
FROM mobil WHERE id = 8;

-- ID 10: Toyota Innova (stok 2 → need +1 unit)
INSERT INTO mobil (nama_mobil, plat_nomor, kapasitas_penumpang, jenis_transmisi, jenis_bahan_bakar, harga_per_hari, stok, status, image_url)
SELECT 
    nama_mobil,
    'R 3343 UI' as plat_nomor,  -- Increment plat nomor
    kapasitas_penumpang,
    jenis_transmisi,
    jenis_bahan_bakar,
    harga_per_hari,
    1 as stok,
    status,
    image_url
FROM mobil WHERE id = 10;

-- ID 13: Suzuki L300 (stok 3 → need +2 units)
-- Unit 2
INSERT INTO mobil (nama_mobil, plat_nomor, kapasitas_penumpang, jenis_transmisi, jenis_bahan_bakar, harga_per_hari, stok, status, image_url)
SELECT 
    nama_mobil,
    'R 5565 IC' as plat_nomor,  -- Increment plat nomor
    kapasitas_penumpang,
    jenis_transmisi,
    jenis_bahan_bakar,
    harga_per_hari,
    1 as stok,
    status,
    image_url
FROM mobil WHERE id = 13;

-- Unit 3
INSERT INTO mobil (nama_mobil, plat_nomor, kapasitas_penumpang, jenis_transmisi, jenis_bahan_bakar, harga_per_hari, stok, status, image_url)
SELECT 
    nama_mobil,
    'R 5566 IC' as plat_nomor,  -- Increment plat nomor
    kapasitas_penumpang,
    jenis_transmisi,
    jenis_bahan_bakar,
    harga_per_hari,
    1 as stok,
    status,
    image_url
FROM mobil WHERE id = 13;

-- ID 14: Isuzu Traga (stok 2 → need +1 unit)
INSERT INTO mobil (nama_mobil, plat_nomor, kapasitas_penumpang, jenis_transmisi, jenis_bahan_bakar, harga_per_hari, stok, status, image_url)
SELECT 
    nama_mobil,
    'R 5595 RU' as plat_nomor,  -- Increment plat nomor
    kapasitas_penumpang,
    jenis_transmisi,
    jenis_bahan_bakar,
    harga_per_hari,
    1 as stok,
    status,
    image_url
FROM mobil WHERE id = 14;

-- Step 2: Update all existing cars to stok = 1
-- This sets original records to individual unit as well
UPDATE mobil SET stok = 1 WHERE stok > 1;

-- Step 3: Verify results
-- Run this after migration to check:
-- SELECT id, nama_mobil, plat_nomor, stok, status FROM mobil ORDER BY nama_mobil, plat_nomor;
