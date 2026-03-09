# Testing Midtrans API dengan Postman

## 1. Test Create Booking (Guest)

**Endpoint:** `POST http://localhost:3001/api/bookings/guest`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "nama_customer": "Test User",
  "email": "test@gmail.com",
  "no_hp": "081234567890",
  "nama_ktp": "Test User KTP",
  "nik": "3201234567890123",
  "foto_ktp": "test_ktp.jpg",
  "mobil_id": 1,
  "tanggal_mulai": "2026-03-05",
  "tanggal_selesai": "2026-03-07",
  "dengan_driver": "ya",
  "catatan_sewa": "Test booking",
  "metode_pembayaran": "midtrans",
  "bank_tujuan": ""
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Booking berhasil dibuat, silakan lanjutkan pembayaran",
  "data": {
    "booking_id": 1,
    "nama_mobil": "Toyota Avanza",
    "durasi_hari": 2,
    "biaya_driver": 50000,
    "total_harga": 350000,
    "status": "menunggu_pembayaran"
  }
}
```

---

## 2. Test Create Midtrans Transaction

**Endpoint:** `POST http://localhost:3001/api/payments/midtrans/create`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "booking_id": 1
}
```

**Expected Response (Tanpa Midtrans Keys):**
```json
{
  "success": false,
  "error": "Midtrans error"
}
```

**Expected Response (Dengan Valid Keys):**
```json
{
  "success": true,
  "message": "Snap token berhasil dibuat",
  "data": {
    "snap_token": "xxxxx-xxxx-xxxx",
    "redirect_url": "https://app.sandbox.midtrans.com/snap/v3/...",
    "order_id": "BOOKING-1-1234567890"
  }
}
```

---

## 3. Test Check Transaction Status

**Endpoint:** `GET http://localhost:3001/api/payments/midtrans/status/{order_id}`

**Example:**
```
GET http://localhost:3001/api/payments/midtrans/status/BOOKING-1-1234567890
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "transaction_status": "pending",
    "order_id": "BOOKING-1-1234567890",
    "gross_amount": "350000.00"
  }
}
```

---

## 4. Test Webhook (Simulated)

**Endpoint:** `POST http://localhost:3001/api/payments/midtrans/notification`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON) - Simulated webhook dari Midtrans:**
```json
{
  "order_id": "BOOKING-1-1234567890",
  "transaction_status": "settlement",
  "gross_amount": "350000.00",
  "payment_type": "credit_card",
  "transaction_id": "12345678-1234-1234-1234-123456789012",
  "fraud_status": "accept",
  "signature_key": "xxxxx"
}
```

**Note:** Signature validation akan fail tanpa real server key

---

## Testing Flow:

1. **Create Booking** → Dapat `booking_id`
2. **Create Transaction** → Error jika belum ada Midtrans keys
3. **Setup Midtrans Keys** di `.env`
4. **Retry Create Transaction** → Dapat `snap_token`
5. **Buka Snap URL** di browser → Test payment
6. **Check Status** → Verify transaction

---

## Tips:

- Gunakan mobil_id yang valid dari database
- Pastikan mobil punya stok > 0
- Tanggal harus format YYYY-MM-DD
- NIK harus 16 digit angka
