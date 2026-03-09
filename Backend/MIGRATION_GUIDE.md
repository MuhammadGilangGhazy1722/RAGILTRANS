# Migration Guide - Perbaikan Database

## Masalah
Backend menggunakan tabel `mobil` dan `sewa`, tetapi database hanya memiliki tabel `cars` dan `bookings`.

## Solusi

### Opsi 1: Database Baru (Direkomendasikan untuk Development)
Jika Anda bisa menghapus database dan mulai dari awal:

```sql
-- Via MySQL CLI atau phpMyAdmin
DROP DATABASE IF EXISTS ragiltrans;
```

Kemudian jalankan ulang `database.sql`:
```bash
mysql -u root -p < database.sql
```

### Opsi 2: Migrasi Database (Jika Ada Data yang Ingin Dipertahankan)
Jalankan script `migrate-database.sql` yang sudah disediakan:

```bash
mysql -u root -p ragiltrans < migrate-database.sql
```

### Opsi 3: Manual via phpMyAdmin atau MySQL Workbench
1. Buka phpMyAdmin atau MySQL Workbench
2. Pilih database `ragiltrans`
3. Jalankan script dari file `migrate-database.sql`

## Verifikasi
Setelah migrasi, verifikasi bahwa tabel berikut sudah ada:
- `users`
- `admin`
- `mobil` (bukan `cars`)
- `sewa` (bukan `bookings`)
- `verifikasi_ktp`
- `payments`

## Setelah Migrasi
1. Restart backend server
2. Test kembali fitur booking

## Troubleshooting
Jika masih error:
1. Cek apakah semua tabel sudah ter-create dengan benar
2. Pastikan foreign key constraints sudah benar
3. Cek log error di terminal backend untuk detail error
