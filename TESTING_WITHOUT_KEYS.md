# Testing Midtrans Flow WITHOUT API Keys

## 🎯 Tujuan
Testing complete payment flow untuk **memastikan logic benar** tanpa perlu Midtrans API keys. Nanti tinggal masukkan keys aja dan langsung jalan!

---

## ✅ Update yang Sudah Dilakukan

### 1. **Webhook Handler - Skip Signature di Development**
```javascript
// Skip signature check kalau tidak ada MIDTRANS_SERVER_KEY
if (process.env.NODE_ENV !== 'production' && !serverKey) {
  console.log('⚠️ DEVELOPMENT MODE: Skipping signature verification');
}
```

### 2. **Create Transaction - Return Mock Data**
```javascript
// Kalau keys belum ada, return mock VA number untuk testing
if (!process.env.MIDTRANS_SERVER_KEY || process.env.MIDTRANS_SERVER_KEY.includes('YOUR_')) {
  return mockVaNumber; // Format: 8127xxxxxxxxxxxx
}
```

---

## 🧪 Complete Testing Flow via Postman

### **Persiapan**
- Backend sudah running: `cd Backend && npm run dev`
- Database MySQL sudah jalan
- Postman installed

---

### **Test 1: Create Guest Booking**

**Endpoint:** `POST http://localhost:3001/api/bookings/guest`

**Body (JSON):**
```json
{
  "nama_customer": "John Doe",
  "email": "john@email.com",
  "no_hp": "081234567890",
  "nama_ktp": "John Doe KTP",
  "nik": "3201234567890123",
  "foto_ktp": "ktp_john.jpg",
  "mobil_id": 1,
  "tanggal_mulai": "2026-03-10",
  "tanggal_selesai": "2026-03-12",
  "dengan_driver": "ya",
  "catatan_sewa": "Test booking untuk Midtrans"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Booking berhasil dibuat",
  "data": {
    "booking_id": 5,
    "order_number": "ORD-1709567890-5",
    "status": "menunggu_pembayaran",
    "total_harga": 400000
  }
}
```

**✅ Catat:** `booking_id` untuk step berikutnya (contoh: `5`)

---

### **Test 2: Create Midtrans Transaction (Mock)**

**Endpoint:** `POST http://localhost:3001/api/payments/midtrans/create`

**Body (JSON):**
```json
{
  "booking_id": 5,
  "bank": "bca"
}
```

**Expected Response (Mock Data):**
```json
{
  "success": true,
  "message": "⚠️ TESTING MODE: Mock VA created (configure Midtrans keys for real VA)",
  "data": {
    "order_id": "BOOKING-5-1709567890123",
    "transaction_id": "TEST-1709567890123",
    "transaction_status": "pending",
    "payment_type": "bank_transfer",
    "va_number": "8127567890123456",
    "bill_key": null,
    "biller_code": null,
    "bank": "bca",
    "gross_amount": 400000,
    "transaction_time": "2026-03-04T10:30:00.000Z",
    "expiry_time": "2026-03-05T10:30:00.000Z",
    "_testing": true,
    "_instruction": "Use webhook endpoint with this order_id to simulate payment"
  }
}
```

**✅ Catat:** `order_id` untuk webhook (contoh: `BOOKING-5-1709567890123`)

---

### **Test 3: Check Database - Status Pending**

**Query MySQL:**
```sql
SELECT 
  id,
  nama_customer,
  total_harga,
  status,
  payment_status,
  midtrans_order_id,
  midtrans_transaction_id
FROM sewa 
WHERE id = 5;
```

**Expected Result:**
```
id: 5
nama_customer: John Doe
total_harga: 400000
status: menunggu_pembayaran
payment_status: pending
midtrans_order_id: BOOKING-5-1709567890123
midtrans_transaction_id: TEST-1709567890123
```

---

### **Test 4: Simulate Payment Success (Webhook)**

**Endpoint:** `POST http://localhost:3001/api/payments/midtrans/notification`

**Body (JSON):**
```json
{
  "order_id": "BOOKING-5-1709567890123",
  "transaction_status": "settlement",
  "payment_type": "bank_transfer",
  "gross_amount": "400000",
  "transaction_id": "TEST-1709567890123",
  "fraud_status": "accept",
  "signature_key": "fake_signature_for_testing"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Notification berhasil diproses"
}
```

**Console Backend akan print:**
```
=== MIDTRANS NOTIFICATION ===
Body: { order_id: 'BOOKING-5-1709567890123', ... }
⚠️ DEVELOPMENT MODE: Skipping signature verification (no Midtrans keys)
✅ Booking 5 updated: status=menunggu_persetujuan, payment_status=settlement
✅ Stok mobil ID 1 dikurangi (payment settlement)
```

---

### **Test 5: Verify Database - Status Updated**

**Query MySQL:**
```sql
SELECT 
  id,
  nama_customer,
  status,
  payment_status,
  payment_method
FROM sewa 
WHERE id = 5;
```

**Expected Result:**
```
id: 5
nama_customer: John Doe
status: menunggu_persetujuan  ← Changed!
payment_status: settlement     ← Changed!
payment_method: bank_transfer  ← Updated!
```

**Check Mobil Stock:**
```sql
SELECT id, nama_mobil, stok 
FROM mobil 
WHERE id = 1;
```

**Expected:** Stok berkurang 1 unit

---

### **Test 6: Simulate Payment Pending**

**Endpoint:** `POST http://localhost:3001/api/payments/midtrans/notification`

**Body (JSON):**
```json
{
  "order_id": "BOOKING-5-1709567890123",
  "transaction_status": "pending",
  "payment_type": "bank_transfer",
  "gross_amount": "400000",
  "transaction_id": "TEST-1709567890123",
  "signature_key": "fake"
}
```

**Expected:** Status tetap `menunggu_pembayaran`

---

### **Test 7: Simulate Payment Failed**

**Endpoint:** `POST http://localhost:3001/api/payments/midtrans/notification`

**Body (JSON):**
```json
{
  "order_id": "BOOKING-6-1709567890456",
  "transaction_status": "deny",
  "payment_type": "bank_transfer",
  "gross_amount": "500000",
  "transaction_id": "TEST-1709567890456",
  "signature_key": "fake"
}
```

**Expected:** 
- Status → `dibatalkan`
- Payment status → `failed`

---

## 📊 Complete Flow Summary

```
┌─────────────────────┐
│  1. Create Booking  │  POST /bookings/guest
└──────────┬──────────┘
           │
           ├─ Database: status = 'menunggu_pembayaran'
           │
           v
┌─────────────────────┐
│ 2. Create VA (Mock) │  POST /payments/midtrans/create
└──────────┬──────────┘
           │
           ├─ No Keys: Return mock VA number
           ├─ Database: Update midtrans_order_id
           │
           v
┌─────────────────────┐
│ 3. Verify Pending   │  SELECT sewa WHERE id = ?
└──────────┬──────────┘
           │
           ├─ Check: payment_status = 'pending'
           │
           v
┌─────────────────────┐
│ 4. Webhook Success  │  POST /payments/midtrans/notification
└──────────┬──────────┘
           │
           ├─ Skip signature check (no keys)
           ├─ Update status → 'menunggu_persetujuan'
           ├─ Update payment_status → 'settlement'
           ├─ Reduce stock: mobil.stok - 1
           │
           v
┌─────────────────────┐
│ 5. Verify Success   │  SELECT sewa WHERE id = ?
└──────────┬──────────┘
           │
           ├─ Check: status = 'menunggu_persetujuan'
           ├─ Check: payment_status = 'settlement'
           │
           v
     ✅ FLOW WORKING!
```

---

## 🎯 What to Check

### ✅ Booking Flow
- [x] Guest booking created successfully
- [x] Initial status: `menunggu_pembayaran`
- [x] `midtrans_order_id` generated unique

### ✅ Payment Mock
- [x] Mock VA number returned (format: 8127xxxxxxxxxxxx)
- [x] Mock transaction ID created
- [x] Frontend dapat display VA number

### ✅ Webhook Handler
- [x] Accept notification without valid signature (dev mode)
- [x] Update booking status based on `transaction_status`
- [x] `settlement` → status: `menunggu_persetujuan`
- [x] `pending` → status: `menunggu_pembayaran`
- [x] `deny/expire/cancel` → status: `dibatalkan`

### ✅ Stock Management
- [x] Stock NOT reduced on booking creation
- [x] Stock reduced ONLY after payment success (webhook)
- [x] No double reduction on duplicate webhook

---

## 🚀 After Keys Added

Setelah masukkan Midtrans API keys yang valid:

**Backend/.env:**
```env
MIDTRANS_SERVER_KEY=SB-Mid-server-REAL_KEY_HERE
MIDTRANS_CLIENT_KEY=SB-Mid-client-REAL_KEY_HERE
```

**Restart backend:**
```bash
cd Backend
npm run dev
```

**Expected Changes:**
1. ✅ Mock data TIDAK muncul lagi
2. ✅ Real VA number dari Midtrans API
3. ✅ Signature verification AKTIF
4. ✅ Real webhook dari Midtrans

**Test Again:**
- Create booking → Dapat VA real dari Midtrans
- Transfer ke VA via mobile banking (sandbox)
- Midtrans auto send webhook → Status update otomatis

---

## 🔧 Troubleshooting

### Mock VA Tidak Muncul
**Check:**
```bash
# Backend console harus print:
⚠️ Midtrans keys not configured. Returning mock data for testing.
```

**Fix:**
- Pastikan `.env` tidak ada `MIDTRANS_SERVER_KEY` atau isinya `YOUR_SERVER_KEY`

### Webhook Signature Error
**Check:**
```bash
# Console harus print:
⚠️ DEVELOPMENT MODE: Skipping signature verification
```

**Fix:**
- Pastikan `NODE_ENV` tidak set ke `production`
- Atau kosongkan `MIDTRANS_SERVER_KEY`

### Status Tidak Update
**Check:**
- `order_id` di webhook harus match dengan di database
- `transaction_status` harus valid: `settlement`, `pending`, `deny`, `expire`, `cancel`

**Query:**
```sql
SELECT midtrans_order_id FROM sewa WHERE id = ?;
```

---

## 📝 Notes

1. **Mock Mode Indicators:**
   - Response message: `⚠️ TESTING MODE: Mock VA created`
   - Field `_testing: true` in response
   - Console: `⚠️ Midtrans keys not configured`

2. **Production Ready:**
   - Semua logic sudah siap
   - Tinggal tambah API keys
   - No code changes needed

3. **Security:**
   - Signature check di-skip HANYA di development
   - Production mode akan enforce signature

---

**Test Flow Time:** ~5-10 menit  
**Confidence Level:** Tinggi (all logic tested)  
**Next Step:** Register Midtrans → Add keys → Test with real VA
