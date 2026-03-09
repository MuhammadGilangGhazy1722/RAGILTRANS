# Setup Midtrans Payment Gateway

Panduan lengkap untuk mengintegrasikan Midtrans Payment Gateway ke dalam RagilTrans.

## 📋 Prerequisites

- Akun Midtrans (Sandbox untuk testing, Production untuk live)
- Node.js dan npm terinstall
- Database MySQL sudah berjalan

## 🔑 Mendapatkan API Keys

### 1. Daftar Akun Midtrans Sandbox (Testing)

1. Buka [https://dashboard.sandbox.midtrans.com/](https://dashboard.sandbox.midtrans.com/)
2. Klik "Sign Up" untuk membuat akun baru
3. Isi form registrasi dengan data yang valid
4. Verifikasi email Anda
5. Login ke dashboard

### 2. Dapatkan Server Key & Client Key

1. Setelah login, buka **Settings** → **Access Keys**
2. Anda akan melihat:
   - **Server Key**: Untuk backend API (contoh: `SB-Mid-server-xxxxxxxxx`)
   - **Client Key**: Untuk frontend (contoh: `SB-Mid-client-xxxxxxxxx`)
3. Copy kedua key tersebut

> ⚠️ **PENTING**: Jangan share Server Key ke publik! Simpan dengan aman.

## ⚙️ Konfigurasi Backend

### 1. Update Environment Variables

Edit file `Backend/.env`:

```env
# Midtrans Configuration
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxxxxxxxxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxxxxxxx
FRONTEND_URL=http://localhost:5173
```

Ganti `xxxxxxxxxxxxxxxxx` dengan key yang Anda dapatkan dari dashboard Midtrans.

### 2. Jalankan Database Migration

Tambahkan kolom-kolom Midtrans ke tabel `sewa`:

```bash
cd Backend
mysql -u root -p ragiltrans < add-midtrans-columns.sql
```

Atau jalankan manual via MySQL Workbench/phpMyAdmin:

```sql
-- Jalankan query dari file: Backend/add-midtrans-columns.sql
ALTER TABLE sewa 
ADD COLUMN midtrans_order_id VARCHAR(100) NULL,
ADD COLUMN midtrans_snap_token TEXT NULL,
ADD COLUMN midtrans_transaction_id VARCHAR(100) NULL,
ADD COLUMN payment_status VARCHAR(50) NULL,
ADD COLUMN payment_method VARCHAR(50) NULL;

ALTER TABLE sewa ADD INDEX idx_midtrans_order_id (midtrans_order_id);
ALTER TABLE sewa ADD INDEX idx_payment_status (payment_status);
```

### 3. Install Dependencies (Sudah dilakukan)

```bash
cd Backend
npm install midtrans-client
```

## ⚙️ Konfigurasi Frontend

### 1. Update Environment Variables

Edit file `Frontend/.env`:

```env
VITE_API_URL=http://localhost:3001
VITE_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxxxxxxx
VITE_MIDTRANS_PRODUCTION=false
```

Ganti `xxxxxxxxxxxxxxxxx` dengan **Client Key** dari Midtrans.

### 2. Dependencies (Sudah ada di kode)

Tidak perlu install package tambahan. Midtrans Snap akan di-load via CDN.

## 🚀 Menjalankan Aplikasi

### 1. Start Backend

```bash
cd Backend
npm run dev
```

Backend akan berjalan di `http://localhost:3001`

### 2. Start Frontend

```bash
cd Frontend
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

## 🧪 Testing Payment Flow

### 1. Test dengan Kartu Kredit (Sandbox)

Midtrans menyediakan kartu testing untuk sandbox:

**Kartu yang Berhasil:**
- Card Number: `4811 1111 1111 1114`
- Expiry: `01/25` (atau bulan/tahun setelah sekarang)
- CVV: `123`

**Kartu yang Gagal:**
- Card Number: `4911 1111 1111 1113`

### 2. Test dengan E-Wallet

- **GoPay**: Gunakan nomor HP testing: `081234567890`
- **ShopeePay**: Otomatis approved di sandbox
- **QRIS**: Akan muncul QR code testing

### 3. Test dengan Virtual Account

Pilih bank (BCA, BNI, Mandiri, dll) dan akan muncul nomor VA testing.

### 4. Flow Testing

1. **User membuat booking:**
   - Buka `http://localhost:5173/sewa`
   - Pilih mobil
   - Isi form booking (data pribadi, KTP, tanggal sewa)
   - Klik "Proses Pembayaran"

2. **Popup Midtrans muncul:**
   - Pilih metode pembayaran (Credit Card, GoPay, VA, dll)
   - Isi detail pembayaran (gunakan kartu testing di atas)
   - Klik "Bayar"

3. **Status berubah otomatis:**
   - Status booking: `menunggu_pembayaran` → `menunggu_persetujuan`
   - Stok mobil berkurang otomatis setelah pembayaran sukses
   - Receipt ditampilkan di frontend

4. **Admin approve booking:**
   - Login admin: `http://localhost:5173/admin/login`
   - Buka "Bookings"
   - Update status dari `menunggu_persetujuan` → `disetujui`

## 🔄 Status Booking

| Status | Deskripsi |
|--------|-----------|
| `menunggu_pembayaran` | Booking dibuat, user belum bayar |
| `menunggu_persetujuan` | Pembayaran berhasil, tunggu admin approve |
| `disetujui` | Admin sudah approve, siap digunakan |
| `selesai` | Sewa selesai |
| `dibatalkan` | Booking dibatalkan (payment failed/expired) |

## 🔔 Webhook Notification

Midtrans akan mengirim notifikasi ke:
```
POST http://localhost:3001/api/payments/midtrans/notification
```

Untuk testing lokal, gunakan **ngrok** agar Midtrans bisa akses localhost:

```bash
# Install ngrok
npm install -g ngrok

# Expose backend ke internet
ngrok http 3001
```

Copy URL ngrok (contoh: `https://xxxx-xx-xxx.ngrok.io`), lalu setting di:
**Midtrans Dashboard** → **Settings** → **Notification URL**:
```
https://xxxx-xx-xxx.ngrok.io/api/payments/midtrans/notification
```

## 📝 Production Setup

Saat deploy ke production:

### 1. Daftar Akun Midtrans Production
- Buka [https://dashboard.midtrans.com/](https://dashboard.midtrans.com/)
- Lengkapi dokumen bisnis (NPWP, KTP, dll)
- Tunggu approval dari Midtrans

### 2. Update Environment Variables

**Backend `.env`:**
```env
MIDTRANS_SERVER_KEY=Mid-server-xxxxxxxxxxxxxxxxx  # Tanpa "SB-"
MIDTRANS_CLIENT_KEY=Mid-client-xxxxxxxxxxxxxxxxx
FRONTEND_URL=https://yourdomain.com
```

**Frontend `.env`:**
```env
VITE_MIDTRANS_CLIENT_KEY=Mid-client-xxxxxxxxxxxxxxxxx
VITE_MIDTRANS_PRODUCTION=true  # PENTING!
```

### 3. Update Notification URL

Di **Midtrans Production Dashboard** → **Settings** → **Notification URL**:
```
https://api.yourdomain.com/api/payments/midtrans/notification
```

## ❓ Troubleshooting

### "snap is not defined"
- Pastikan Midtrans Snap script sudah load (cek Console browser)
- Pastikan `VITE_MIDTRANS_CLIENT_KEY` sudah diisi dengan benar

### "Invalid signature"
- Pastikan `MIDTRANS_SERVER_KEY` di backend benar
- Cek apakah menggunakan key yang sama (sandbox vs production)

### Payment berhasil tapi status tidak update
- Cek console backend untuk log webhook
- Pastikan webhook URL bisa diakses Midtrans
- Gunakan ngrok untuk testing lokal

### Database error saat create booking
- Pastikan migration sudah dijalankan
- Cek apakah kolom `midtrans_order_id`, `payment_status`, dll sudah ada

## 📚 Referensi

- [Midtrans Documentation](https://docs.midtrans.com/)
- [Snap Integration Guide](https://docs.midtrans.com/en/snap/overview)
- [Testing Payment](https://docs.midtrans.com/en/technical-reference/sandbox-test)

## 🆘 Support

Jika ada masalah:
1. Cek error di Console browser (F12)
2. Cek log backend di terminal
3. Cek dokumentasi Midtrans
4. Contact support Midtrans: support@midtrans.com
