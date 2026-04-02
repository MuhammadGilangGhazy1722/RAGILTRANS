# 🔧 Konfigurasi Supabase Lengkap - Panduan Setup

Projek ini menggunakan **Supabase** (managed PostgreSQL database) bukan MySQL lokal. Panduan ini menjelaskan langkah-langkah lengkap untuk setup Supabase.

---

## 📋 Daftar Isi

1. [Apa itu Supabase?](#apa-itu-supabase)
2. [Persiapan](#persiapan)
3. [Step-by-Step Setup](#step-by-step-setup)
4. [Membuat Tabel Database](#membuat-tabel-database)
5. [Konfigurasi Environment Variables](#konfigurasi-environment-variables)
6. [Testing Connection](#testing-connection)
7. [Troubleshooting](#troubleshooting)

---

## ℹ️ Apa itu Supabase?

**Supabase** adalah:
- ✅ Managed PostgreSQL database (cloud-based)
- ✅ Open source Firebase alternative
- ✅ Auto REST API generation
- ✅ Real-time subscriptions
- ✅ Authentication built-in
- ✅ Gratis untuk development (dengan limitations)

**Keuntungan dibanding MySQL lokal:**
- Tidak perlu install MySQL di local/server
- Auto backups dan disaster recovery
- Scalable infrastructure
- Security management built-in
- Akses dari mana saja (cloud)

---

## 📦 Persiapan

Sebelum mulai, siapkan:

- [ ] Email untuk akun Supabase (gunakan email yang aktif)
- [ ] Browser modern (Chrome, Firefox, Safari, Edge)
- [ ] Access ke Terminal/Command Prompt

---

## 🚀 Step-by-Step Setup

### **Step 1: Buat Akun Supabase**

1. Buka https://supabase.com
2. Klik **"Start your project"** atau **"Sign Up"**
3. Pilih sign up dengan GitHub atau Email:
   - **Recommended**: Gunakan GitHub (lebih cepat)
   - Atau buat akun baru dengan email

4. Verifikasi email Anda jika diminta

**Screenshot:**
```
Homepage Supabase
↓
Sign Up button (top right)
↓
Choose GitHub / Email
↓
Complete verification
```

---

### **Step 2: Buat Project Baru**

1. Setelah login, klik **"New Project"**
2. Isi form:

   ```
   Project Name: ragiltrans
   Database Password: (simpan dengan aman, jangan lupa!)
   Region: (pilih terdekat dengan lokasi Anda)
                → Asia Pacific: Singapore
   
   ```

3. Tunggu project dibuat (biasanya 1-2 menit)

**Tips:**
- Gunakan password yang kuat (min 8 karakter, mix huruf/angka/simbol)
- Simpan password ini di tempat aman
- Region Asia Singapore: latency terbaik untuk Indonesia

---

### **Step 3: Copy API Keys**

Setelah project siap, copy credentials yang diperlukan:

1. Buka Project → Menu **Settings** → **API**
2. Cari section **Project URL** dan **API Keys**

**Copy dua values ini:**

| Variable | Location | Gunakan untuk |
|----------|----------|---|
| `SUPABASE_URL` | **Project URL** | `process.env.SUPABASE_URL` |
| `SUPABASE_KEY` | **anon public** (key paling atas) | `process.env.SUPABASE_KEY` |

**⚠️ PENTING:**
- Ada 2 keys: `anon public` dan `service_role secret`
- **Gunakan ANON PUBLIC** untuk `.env`
- **Service Role Secret** hanya untuk server-side operations (sudah aman karena server-side)

**Screenshot lokasi:**
```
Settings
  └── API
       ├── Project URL: https://xxxxx.supabase.co
       ├── anon public key: eyJhbG... (GUNAKAN INI)
       └── service_role secret: eyJh... (untuk backend only)
```

---

## 🗄️ Membuat Tabel Database

### **Opsi A: Menggunakan SQL Editor (Recommended)**

1. Buka Project → Menu **SQL Editor** (kiri sidebar)
2. Klik **"New Query"**
3. Copy seluruh isi file `Backend/database.sql`
4. Paste ke SQL Editor
5. Klik **"Run"** (atau tekan `Cmd/Ctrl + Enter`)
6. Tunggu sampai selesai (biasanya 10-30 detik)

**Screenshot:**
```
SQL Editor (left menu)
    ↓
New Query button
    ↓
Paste database.sql content
    ↓
Run button (top right)
    ↓
Check "Results" tab
```

### **Opsi B: Usando Table Editor (Jika SQL Editor tidak work)**

Jika SQL Editor error, buat tabel manual:

1. Buka **Table Editor** (left menu)
2. Klik **"Create a new table"**
3. Buat sesuai dengan struktur di `database.sql`

**Tabel yang perlu dibuat:**
- `users`
- `admin`
- `mobil` (cars)
- `sewa` (bookings)
- `verifikasi_ktp` (KTP verification)
- `payments`
- `password_resets`

**Tips:** Lihat nama kolom dan tipe data di `database.sql`

---

### **Verifikasi Tabel Berhasil Dibuat**

1. Buka **Table Editor** (left menu)
2. Di sidebar, Anda akan melihat daftar tabel:
   ```
   ✓ users
   ✓ admin
   ✓ mobil
   ✓ sewa
   ✓ verifikasi_ktp
   ✓ payments
   ```

3. Jika semua tabel ada → **Setup berhasil!** ✅

---

## 🔐 Konfigurasi Environment Variables

### **Backend Configuration**

1. Buka file `Backend/.env` (atau buat dari `.env.example`)

2. Isi dengan credentials dari Supabase:

   ```env
   # ========== BACKEND CONFIGURATION ==========
   PORT=3001
   NODE_ENV=development
   
   # ========== DATABASE CONFIGURATION (SUPABASE) ==========
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   
   # ========== JWT CONFIGURATION ==========
   JWT_SECRET=my-super-secret-key-min-32-characters-long!!!
   JWT_EXPIRES_IN=7d
   
   # ========== FRONTEND CONFIGURATION ==========
   FRONTEND_URL=http://localhost:5173
   
   # ========== BACKEND URL ==========
   BACKEND_URL=http://localhost:3001
   
   # ========== MIDTRANS CONFIGURATION ==========
   MIDTRANS_SERVER_KEY=SB-Mid-server-xxxx
   MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxx
   MIDTRANS_IS_PRODUCTION=false
   
   # ========== OPTIONAL: EMAIL CONFIGURATION ==========
   # EMAIL_USER=your-email@gmail.com
   # EMAIL_PASSWORD=your-app-password
   # EMAIL_FROM_NAME=RagilTrans
   
   # ========== OPTIONAL: GOOGLE OAUTH ==========
   # GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
   # GOOGLE_CLIENT_SECRET=xxx
   # GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
   ```

3. Save file

**⚠️ PENTING:**
- `SUPABASE_URL` harus lengkap dengan domain `.supabase.co`
- `SUPABASE_KEY` harus copy persis (include semua karakter)
- `JWT_SECRET` harus 32+ characters (untuk security)
- `BACKEND_URL` harus eksak (untuk OAuth callback)

### **Frontend Configuration**

1. Buka file `Frontend/.env` (atau buat dari `.env.example`)

2. Isi dengan:

   ```env
   NODE_ENV=development
   
   # ========== BACKEND API CONFIGURATION ==========
   VITE_API_URL=
   
   # ========== STATIC FILES SERVER ==========
   VITE_SERVER_URL=http://localhost:3001
   
   # ========== MIDTRANS CONFIGURATION ==========
   VITE_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxx
   VITE_MIDTRANS_PRODUCTION=false
   ```

3. Save file

**Notes:**
- Leave `VITE_API_URL` kosong → Gunakan Vite proxy (lebih simple)
- `VITE_SERVER_URL` harus sama dengan `BACKEND_URL`
- `VITE_MIDTRANS_CLIENT_KEY` beda dengan backend (ini untuk client-side)

---

## ✅ Testing Connection

### **Test 1: Check Database Connection**

1. Buka Terminal/Command Prompt di folder `Backend`
2. Jalankan:

   ```bash
   npm run dev
   ```

3. Lihat output, jika ada message:
   ```
   ✅ Server running on port 3001
   ✅ Database: ragiltrans
   ```
   → **Connection berhasil!** ✅

Jika error:
   ```
   ❌ ENOTFOUND (problem dengan hostname)
   ❌ UNAUTHORIZED (SUPABASE_KEY salah)
   ```
   → Lihat [Troubleshooting](#troubleshooting)

### **Test 2: Check Database via Supabase UI**

1. Buka Supabase Dashboard
2. Menu **Table Editor**
3. Klik salah satu tabel (e.g., `users`)
4. Harusnya muncul tabel kosong dengan kolom-kolom

---

### **Test 3: Create Test User via API**

1. Buka Postman atau REST Client
2. Send POST request:

   **Request:**
   ```http
   POST http://localhost:3001/api/auth/register
   Content-Type: application/json
   
   {
     "nama": "Test User",
     "username": "testuser",
     "email": "test@example.com",
     "no_hp": "081234567890",
     "password": "password123",
     "confirm_password": "password123",
     "agree_terms": true
   }
   ```

3. Response harusnya:
   ```json
   {
     "success": true,
     "message": "Registrasi berhasil, silakan login"
   }
   ```

4. Cek di Supabase:
   - Buka **Table Editor** → **users**
   - Harusnya ada 1 user baru dengan data yang Anda register

**Jika berhasil:**
- ✅ Backend connection OK
- ✅ Database creation OK
- ✅ Environment variables OK

---

## 📱 Setup Frontend untuk Development

### **Konfigurasi Vite Server Proxy**

File `vite.config.ts` sudah dikonfigurasi:

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:3001',  // Backend URL
    changeOrigin: true,
  }
}
```

Ini berarti:
- Frontend request ke `/api/auth/register`
- Proxy ke `http://localhost:3001/api/auth/register`

### **Jalankan Frontend**

1. Buka Terminal di folder `Frontend`
2. Install dependencies (jika belum):
   ```bash
   npm install
   # atau
   pnpm install
   ```

3. Start dev server:
   ```bash
   npm run dev
   ```

4. Buka browser ke `http://localhost:5173`

**Tips:**
- Frontend dan Backend harus jalan di terminal terpisah
- Frontend: port 5173
- Backend: port 3001

---

## 🔍 Troubleshooting

### **Error: Cannot find module 'supabase'**

**Solusi:**
```bash
cd Backend
npm install @supabase/supabase-js
```

---

### **Error: ENOTFOUND xxxxx.supabase.co**

**Penyebab:** DNS tidak bisa resolve Supabase URL

**Solusi:**
1. Check internet connection
2. Test ping: `ping xxxxx.supabase.co`
3. Copy ulang `SUPABASE_URL` dari Supabase dashboard
4. Pastikan format: `https://xxxxx.supabase.co` (tanpa trailing slash)

---

### **Error: UNAUTHORIZED (401)**

**Penyebab:** `SUPABASE_KEY` salah atau expired

**Solusi:**
1. Copy ulang key dari Supabase dashboard
2. Pastikan menggunakan **anon public key** (bukan service_role)
3. Reload dashboard jika sudah lama
4. Restart backend: `npm run dev`

---

### **Error: relation "users" does not exist**

**Penyebab:** Tabel tidak berhasil dibuat

**Solusi:**
1. Buka Supabase dashboard → **Table Editor**
2. Cek apakah tabel `users` ada
3. Jika tidak ada, jalankan `database.sql` di SQL Editor
4. Pastikan tidak ada error saat menjalankan SQL

---

### **Tabel terlihat di Supabase tapi API error**

**Penyebab:** Permission issues atau RLS (Row Level Security)

**Solusi:**
1. Buka Table → **Edit table** → **Policies**
2. Disable RLS untuk development (HATI-HATI untuk production!)
3. Atau set policies dengan benar:
   ```sql
   CREATE POLICY "Public read" ON users
   FOR SELECT USING (true);
   ```

---

## 🔒 Production Checklist

Sebelum go live, pastikan:

- [ ] Ganti `SUPABASE_KEY` dengan `service_role secret` (untuk backend only)
- [ ] Set `NODE_ENV=production` di backend
- [ ] Set `VITE_MIDTRANS_PRODUCTION=true` jika pakai production Midtrans keys
- [ ] Enable RLS (Row Level Security) untuk security
- [ ] Setup proper authentication policies
- [ ] Backup database secara regular
- [ ] Monitor costs (Supabase charge based on usage)
- [ ] Setup domain custom (jangan pakai localhost)
- [ ] Enable HTTPS everywhere

---

## 📚 Referensi Berguna

- **Supabase Docs:** https://supabase.com/docs
- **Supabase JS Library:** https://github.com/supabase/supabase-js
- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **Project Dashboard:** https://app.supabase.com

---

## 💡 Tips & Tricks

### **Real-time Subscriptions**

Supabase support real-time updates (mirip Firebase):

```javascript
const subscription = supabase
  .from('sewa')
  .on('*', payload => {
    console.log('Change received!', payload)
  })
  .subscribe()
```

### **Row Level Security (RLS)**

Untuk fitur multi-tenancy atau permission-based access, gunakan RLS:

```sql
-- User hanya bisa lihat data sendiri
CREATE POLICY "Users can see own data" ON sewa
FOR SELECT USING (auth.uid() = user_id);
```

### **Backup Otomatis**

Supabase backup otomatis setiap hari untuk production. Untuk manual backup:

1. Buka **Settings** → **Backups**
2. Klik **Create backup**

---

## ❓ FAQ

### **Q: Apakah gratis?**
**A:** Ya, Supabase punya free tier generus untuk development. Lihat detail di https://supabase.com/pricing

### **Q: Bisa pakai MySQL?**
**A:** Bisa, tapi perlu ubah config dan semua .from() queries menjadi MySQL syntax. Lebih simple pakai Supabase.

### **Q: Bagaimana kalau traffic besar?**
**A:** Supabase auto-scale. Cek pricing page untuk details.

### **Q: Bisa offline?**
**A:** Tidak perlu (cloud-based). Tapi bisa implement sync saat online/offline dengan library seperti Realm atau PouchDB.

### **Q: Gimana cara reset database?**
**A:** Di Supabase Settings → Danger Zone → Reset database. Tapi hati-hati, ini delete semua data!

---

## 📞 Support

Jika ada pertanyaan:
- Supabase Community: https://discord.supabase.io
- GitHub Issues: https://github.com/supabase/supabase/issues
- Email: support@supabase.io

---

**Last Updated:** April 2026
**Status:** ✅ Complete & Tested
