# ⚡ Supabase Quick Start - 5 Menit Setup

Panduan cepat untuk setup Supabase tanpa details.

---

## 🚀 Quick Setup (5 Steps)

### **1. Buat Supabase Account**
- Buka https://supabase.com
- Sign up dengan GitHub atau Email
- Verify email Anda

### **2. Create New Project**
- Klik "New Project"
- Project Name: `ragiltrans`
- Database Password: `simpan dengan aman!`
- Region: Asia Singapore

Tunggu 1-2 menit sampai project siap.

### **3. Copy API Keys**
Dashboard → Settings → API

Copy 2 things:
- **SUPABASE_URL**: `https://xxxxx.supabase.co`
- **SUPABASE_KEY**: Key dengan label "anon public"

### **4. Create Database Tables**

Go to SQL Editor → New Query

Copy semua isi file `Backend/database.sql` ke query editor.

Klik **RUN**. Tunggu selesai.

### **5. Setup .env Files**

**Backend/.env:**
```env
PORT=3001
NODE_ENV=development
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOi...
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3001
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxx
MIDTRANS_IS_PRODUCTION=false
```

**Frontend/.env:**
```env
NODE_ENV=development
VITE_API_URL=
VITE_SERVER_URL=http://localhost:3001
VITE_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxx
VITE_MIDTRANS_PRODUCTION=false
```

---

## ✅ Test Connection

**Terminal 1 - Backend:**
```bash
cd Backend
npm run dev
```

Should show:
```
✅ Server running on port 3001
✅ Database: ragiltrans
```

**Terminal 2 - Frontend:**
```bash
cd Frontend
npm run dev
```

Should show:
```
Local: http://localhost:5173
```

---

## 🎯 Verify Database Created

1. Dashboard → Table Editor (left menu)
2. Check apakah ada tabel:
   - ✓ users
   - ✓ admin
   - ✓ mobil
   - ✓ sewa
   - ✓ verifikasi_ktp
   - ✓ payments

Done! 🎉

---

## ❌ Error Troubleshooting

| Error | Solution |
|-------|----------|
| `ENOTFOUND xxxxx.supabase.co` | Check internet, verify SUPABASE_URL format |
| `UNAUTHORIZED (401)` | Copy SUPABASE_KEY again, check anon public key |
| `relation "users" does not exist` | Run database.sql in SQL Editor |
| `Cannot find module` | Run `npm install` in Backend folder |

---

## 📚 For Detailed Info

See `SUPABASE_SETUP.md` untuk penjelasan lengkap.

---

## 🔗 Useful Links

- Supabase Dashboard: https://app.supabase.com
- Supabase Docs: https://supabase.com/docs
- Project SQL Editor: [your-project].supabase.co → SQL Editor menu

---

**Need help?** Check `SUPABASE_SETUP.md` → Troubleshooting section.
