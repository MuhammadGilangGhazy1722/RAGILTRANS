# Midtrans Core API Implementation

## ✅ Perubahan dari Snap ke Core API

Implementasi telah diubah dari **Midtrans Snap** (popup otomatis) ke **Midtrans Core API** (custom UI dengan Virtual Account).

---

## 🎯 Keuntungan Core API

1. **UI Custom**: Menggunakan UI pembayaran yang sudah kamu buat sendiri
2. **Virtual Account**: User mendapat nomor VA untuk transfer bank
3. **Support Multiple Banks**: BCA, Mandiri, BNI, BRI, BSI (fallback BCA), CIMB
4. **No Popup**: Semua tetap di halaman kamu, tidak ada redirect ke Midtrans
5. **Lebih Fleksibel**: Bisa custom payment instructions sesuai kebutuhan

---

## 🔄 Alur Pembayaran Baru

### User Flow:
```
1. Pilih Mobil
   ↓
2. Isi Form Data Diri (Nama, Email, HP)
   ↓
3. Upload KTP (Nama, NIK, Foto)
   ↓
4. Pilih Detail Sewa (Tanggal, Driver)
   ↓
5. Step 4: Pembayaran
   - Pilih Bank (BCA/Mandiri/BNI/BRI/BSI/CIMB)
   - Klik "Buat Virtual Account {Bank}"
   ↓
6. Sistem membuat booking + generate VA number
   ↓
7. Tampil Virtual Account Number + Instruksi
   ↓
8. User transfer ke VA number via mobile banking
   ↓
9. Midtrans otomatis deteksi pembayaran
   ↓
10. Webhook update status booking → "menunggu_persetujuan"
   ↓
11. Admin approve → Status jadi "disetujui"
```

### Technical Flow:
```
Frontend                Backend                 Midtrans                Database
   |                       |                       |                       |
   |-- Pilih Bank -------->|                       |                       |
   |                       |-- Core API charge --->|                       |
   |                       |<-- VA Number ---------|                       |
   |<-- Show VA Number ----|                       |                       |
   |                       |-- Update sewa --------|                       |
   |                       |                       |                   [status: menunggu_pembayaran]
   |                       |                       |                       |
   |   (User bayar)        |                       |                       |
   |                       |<-- Webhook ----------|                       |
   |                       |-- Update status ------|                   [status: menunggu_persetujuan]
   |                       |-- Reduce stock -------|                   [stok: -1]
```

---

## 📝 File yang Diubah

### Backend:

#### 1. `Backend/src/controllers/payment.controller.js`
**Fungsi `createMidtransTransaction()`** - Diubah total:
- **Sebelumnya**: Generate Snap token
- **Sekarang**: Charge Core API dengan bank transfer
- **Parameter baru**: `bank` (bca/mandiri/bni/bri/bsi/cimb)
- **Return data**:
  - `va_number`: Nomor Virtual Account (untuk BCA, BNI, BRI, CIMB)
  - `bill_key`: Kode bayar Mandiri
  - `biller_code`: Biller code Mandiri
  - `expiry_time`: Batas waktu pembayaran
  - `gross_amount`: Total yang harus dibayar

```javascript
// Contoh response dari backend
{
  "success": true,
  "data": {
    "order_id": "BOOKING-123-1234567890",
    "va_number": "8127012345678901",  // Untuk BCA
    "bank": "bca",
    "gross_amount": 350000,
    "expiry_time": "2026-03-05 23:59:59"
  }
}
```

#### 2. `Backend/src/controllers/payment.controller.js`
**Webhook Handler** - Tetap sama, sudah support Core API

---

### Frontend:

#### 1. `Frontend/src/App.tsx`
- **Dihapus**: Loading Midtrans Snap script
- **Alasan**: Core API tidak butuh script Snap

#### 2. `Frontend/src/config/api.ts`
- **Dihapus**: `snapUrl` di `MIDTRANS_CONFIG`
- **Tetap**: `clientKey` (untuk keperluan lain)

#### 3. `Frontend/src/pages/user/sewa.tsx`
**Perubahan besar**:

**a) State baru:**
```typescript
const [paymentInstructions, setPaymentInstructions] = createSignal<any>(null);
const [isProcessingPayment, setIsProcessingPayment] = createSignal(false);
```

**b) Function `handleBayarSekarang()` - DIUBAH TOTAL:**
- **Sebelumnya**: Buka mobile banking, konfirmasi manual
- **Sekarang**: 
  - Create booking via API
  - Call Midtrans Core API untuk generate VA
  - Simpan payment instructions

**c) Function `handleSubmitBooking()` - DISEDERHANAKAN:**
- **Sebelumnya**: Create booking → Call Snap → Show popup → Handle callbacks
- **Sekarang**: Langsung show receipt dengan VA info

**d) UI Step 4 - DITAMBAHKAN:**
- **Virtual Account Display**: Nomor VA besar dengan tombol copy
- **Bill Key Display**: Untuk Mandiri e-channel
- **Payment Instructions**: Card dengan cara bayar
- **Expiry Warning**: Batas waktu pembayaran
- **Total Amount**: Dengan format Rupiah

---

## 🏦 Bank Support

| Bank | Payment Type | Output | Status |
|------|-------------|--------|--------|
| BCA | `bank_transfer` | VA Number (16 digit) | ✅ Supported |
| Mandiri | `echannel` | Bill Key + Biller Code | ✅ Supported |
| BNI | `bank_transfer` | VA Number (16 digit) | ✅ Supported |
| BRI | `bank_transfer` | VA Number (16 digit) | ✅ Supported |
| BSI | `bank_transfer` | Fallback ke BCA | ⚠️ Limited |
| CIMB | `bank_transfer` | VA Number (16 digit) | ✅ Supported |

**Note**: BSI belum fully supported di Midtrans Sandbox, jadi akan fallback ke BCA.

---

## 🧪 Cara Testing

### 1. Setup Midtrans Sandbox

Pastikan `.env` files sudah diisi:

**Backend/.env:**
```env
MIDTRANS_SERVER_KEY=SB-Mid-server-XXXXXXXXXXXXXXX
MIDTRANS_CLIENT_KEY=SB-Mid-client-XXXXXXXXXXXXXXX
FRONTEND_URL=http://localhost:5173
```

**Frontend/.env:**
```env
VITE_MIDTRANS_CLIENT_KEY=SB-Mid-client-XXXXXXXXXXXXXXX
VITE_API_URL=http://localhost:3001
```

### 2. Start Aplikasi

Terminal 1 - Backend:
```bash
cd Backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd Frontend
npm run dev
```

### 3. Test Flow

1. Buka http://localhost:5173/sewa
2. Pilih mobil → Klik "Sewa Sekarang"
3. Isi form step 1-3
4. Di step 4:
   - Pilih bank (contoh: BCA)
   - Klik "Buat Virtual Account BCA"
5. Akan muncul VA number
6. Copy VA number
7. Untuk testing, bisa:
   - **Opsi A**: Simulasi via Midtrans Dashboard (Transaction → Find → Set status)
   - **Opsi B**: Test webhook manual via Postman (lihat POSTMAN_TEST.md)

### 4. Test Webhook (Manual via Postman)

**Endpoint:** `POST http://localhost:3001/api/payments/midtrans/notification`

**Body:**
```json
{
  "order_id": "BOOKING-5-1234567890",
  "transaction_status": "settlement",
  "payment_type": "bank_transfer",
  "gross_amount": "350000",
  "transaction_id": "test-123",
  "signature_key": "CALCULATED_HASH"
}
```

**Cara hitung signature_key:**
```javascript
const crypto = require('crypto');
const order_id = "BOOKING-5-1234567890";
const status_code = "200"; // atau transaction_status
const gross_amount = "350000.00";
const server_key = "YOUR_SERVER_KEY";

const hash = crypto.createHash('sha512')
  .update(`${order_id}${status_code}${gross_amount}${server_key}`)
  .digest('hex');

console.log(hash);
```

---

## 🎨 UI Components Baru

### Virtual Account Display Card

Komponen hijau berisi:
- ✅ Bank name (uppercase)
- 💳 VA Number (16 digit, font mono)
- 📋 Copy button (clipboard)
- 💰 Total amount (Rupiah format)
- ⏰ Expiry time warning
- 📝 Payment instructions

**Fitur:**
- Auto-copy VA number ke clipboard
- Toast notification saat copy
- Responsive design
- Animasi loading saat generate VA

---

## 🔐 Security

1. **Signature Verification**: Webhook diverifikasi dengan SHA512 hash
2. **Order ID Unique**: Menggunakan timestamp untuk hindari duplikasi
3. **Amount Validation**: Gross amount di-round ke integer (Midtrans requirement)
4. **Status Checking**: Prevent double payment untuk booking yang sama

---

## 📊 Database Flow

### Status Progression:

1. **Create Booking**:
   ```sql
   status = 'menunggu_pembayaran'
   payment_status = 'pending'
   midtrans_order_id = 'BOOKING-5-1234567890'
   ```

2. **After Payment Success (via Webhook)**:
   ```sql
   status = 'menunggu_persetujuan'
   payment_status = 'settlement'
   midtrans_transaction_id = 'xxxx'
   payment_method = 'bank_transfer'
   
   -- Stock updated:
   UPDATE mobil SET stok = stok - 1 WHERE id = ?
   ```

3. **Admin Approval**:
   ```sql
   status = 'disetujui'
   ```

---

## 🆚 Perbandingan: Snap vs Core API

| Aspek | Snap (Sebelumnya) | Core API (Sekarang) |
|-------|------------------|---------------------|
| **UI** | Popup Midtrans | Custom UI kamu |
| **Payment Methods** | 20+ (card, ewallet, VA, dll) | Bank Transfer/VA only |
| **Implementation** | 50 lines code | 200 lines code |
| **User Experience** | Popup overlay | Stay in page |
| **Customization** | Limited | Full control |
| **Development Time** | 1-2 jam | 4-6 jam |
| **Maintenance** | Easy (Midtrans handle UI) | Medium (handle UI sendiri) |
| **Best For** | Quick setup, banyak metode | Custom branding, VA only |

---

## 🚀 Next Steps

### Yang Sudah Selesai:
- ✅ Backend Core API implementation
- ✅ Frontend UI dengan VA display
- ✅ Webhook handler
- ✅ Multi-bank support
- ✅ Payment instructions

### Yang Perlu Dilakukan:
- ⏳ **Testing dengan real Midtrans account**
- ⏳ **Setup webhook URL** (butuh ngrok atau deploy ke server)
- ⏳ **WA notification helper** (1-2 jam)
- ⏳ **Payment status polling** (optional, untuk auto-update status tanpa refresh)

---

## 💡 Tips

### 1. Testing Sandbox
- Sandbox tidak perlu bayar beneran
- Bisa manual set status di Midtrans Dashboard
- Atau simulasi webhook via Postman

### 2. Production Checklist
- [ ] Update `.env` dengan production keys (bukan SB- prefix)
- [ ] Setup webhook URL di Midtrans Dashboard
- [ ] Update `isProduction: true` di config
- [ ] Test dengan nominal real
- [ ] Monitor webhook logs

### 3. Troubleshooting
- **VA tidak muncul**: Cek console browser, pastikan API call success
- **Webhook gagal**: Cek signature_key calculation
- **Status tidak update**: Cek webhook URL accessible dari Midtrans
- **Bank tidak support**: Pastikan bank ada di Midtrans sandbox

---

## 📞 Support

Jika ada error atau pertanyaan:
1. Cek console browser (F12) untuk error frontend
2. Cek terminal backend untuk error log
3. Cek Midtrans Dashboard → Transactions untuk status
4. Lihat webhook logs di backend

---

**Created**: March 4, 2026  
**Last Updated**: March 4, 2026  
**Version**: Core API v1.0
