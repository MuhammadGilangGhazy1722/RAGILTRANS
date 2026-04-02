# ✅ Supabase Configuration Checklist

Status: **CONFIGURED & DOCUMENTED** ✅

---

## 📋 What Has Been Done

- [x] Created comprehensive Supabase documentation (`SUPABASE_SETUP.md`)
- [x] Created quick start guide (`SUPABASE_QUICK_START.md`)
- [x] Updated `.env.example` files with complete Supabase config
- [x] Updated backend port to **3001** (fixed port conflict)
- [x] Fixed Vite proxy to point to correct backend port
- [x] Added detailed environment variable explanations
- [x] Added troubleshooting guide
- [x] Added production checklist

---

## 🎯 What You Need To Do

### **Phase 1: Supabase Setup (5-10 minutes)**

- [ ] **Create Supabase Account**
  - Go to https://supabase.com
  - Sign up with GitHub or Email
  - Verify your email

- [ ] **Create New Project**
  - Project Name: `ragiltrans`
  - Set strong database password
  - Region: Asia Pacific - Singapore (for Indonesia)

- [ ] **Copy API Credentials**
  - Get `SUPABASE_URL` from Settings → API → Project URL
  - Get `SUPABASE_KEY` from Settings → API → anon public key

- [ ] **Create Database Tables**
  - Open SQL Editor in Supabase dashboard
  - Copy entire `Backend/database.sql`
  - Run in SQL Editor
  - Verify all tables created in Table Editor

### **Phase 2: Environment Setup (5 minutes)**

- [ ] **Create Backend/.env**
  - Copy from `Backend/.env.example`
  - Fill in `SUPABASE_URL` and `SUPABASE_KEY`
  - Set `JWT_SECRET` (min 32 characters)
  - Update `MIDTRANS_*` keys if you have them

- [ ] **Create Frontend/.env**
  - Copy from `Frontend/.env.example`
  - Set `VITE_SERVER_URL=http://localhost:3001`
  - Update `VITE_MIDTRANS_CLIENT_KEY` if you have it

### **Phase 3: Testing (5-10 minutes)**

- [ ] **Test Backend Connection**
  ```bash
  cd Backend
  npm install  # if not done yet
  npm run dev
  ```
  - Should show: `✅ Server running on port 3001`

- [ ] **Test Frontend Connection**
  ```bash
  cd Frontend
  npm install  # if not done yet
  npm run dev
  ```
  - Should run on `http://localhost:5173`

- [ ] **Test Database via API**
  - Open Postman or REST Client
  - Create test user via `/api/auth/register`
  - Verify user appears in Supabase Table Editor

- [ ] **Verify Tables**
  - Check Supabase Table Editor
  - All tables should be present:
    - users
    - admin
    - mobil
    - sewa
    - verifikasi_ktp
    - payments

---

## 📁 Files Configuration

### **Backend Files** ✅

| File | Status | Purpose |
|------|--------|---------|
| `.env.example` | ✅ Updated | Template dengan semua config Supabase |
| `.env` | ⏳ Create | Your actual config (gitignored) |
| `src/config/db.js` | ✅ Sudah setup | Supabase client initialization |
| `src/app.js` | ✅ Port OK | Uses Supabase config |
| `database.sql` | ✅ Ready | SQL schema untuk Supabase |

### **Frontend Files** ✅

| File | Status | Purpose |
|------|--------|---------|
| `.env.example` | ✅ Updated | Template dengan config Vite & Supabase |
| `.env` | ⏳ Create | Your actual config (gitignored) |
| `vite.config.ts` | ✅ Fixed | Proxy updated to port 3001 |
| `src/config/api.ts` | ✅ Ready | API endpoints configuration |

---

## 🔑 Environment Variables Quick Reference

### **Backend Critical Variables**

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=your-super-secret-key-min-32-chars-long!!!
```

### **Backend Optional Variables**

```env
PORT=3001                              # Backend port
NODE_ENV=development                   # or production
MIDTRANS_SERVER_KEY=SB-Mid-server-xxx # Midtrans (if using)
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxx # Midtrans (if using)
```

### **Frontend Variables**

```env
VITE_API_URL=                         # Leave empty for proxy
VITE_SERVER_URL=http://localhost:3001 # Same as backend
VITE_MIDTRANS_CLIENT_KEY=SB-Mid-client-xxx # Midtrans (if using)
```

---

## 🚨 Common Issues & Solutions

### **Issue 1: `relation "users" does not exist`**
- **Cause**: Database tables not created
- **Fix**: Run `database.sql` in SQL Editor
- **Check**: Verify tables in Table Editor

### **Issue 2: `UNAUTHORIZED (401)`**
- **Cause**: Wrong SUPABASE_KEY
- **Fix**: Copy SUPABASE_KEY again from dashboard
- **Note**: Use **anon public** key, not service_role

### **Issue 3: `ENOTFOUND xxxxx.supabase.co`**
- **Cause**: Network/DNS issue
- **Fix**: Check SUPABASE_URL format (must have https://)
- **Test**: Try ping from terminal

### **Issue 4: `Module not found: @supabase/supabase-js`**
- **Cause**: Dependencies not installed
- **Fix**: Run `npm install` in Backend folder
- **Check**: package.json has `@supabase/supabase-js` dependency

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (React/Solid)             │
│                  localhost:5173                      │
│                    ↓ /api proxy                      │
├─────────────────────────────────────────────────────┤
│              Vite Dev Server (Proxy)                 │
│                                                      │
│        Routes /api → http://localhost:3001           │
└─────────────────────────────────────────────────────┘
                         ↓ REST API
┌─────────────────────────────────────────────────────┐
│            Backend (Express + Node.js)               │
│                 localhost:3001                       │
│          (SUPABASE_URL, SUPABASE_KEY)               │
└─────────────────────────────────────────────────────┘
                    ↓ REST
┌─────────────────────────────────────────────────────┐
│         Supabase (PostgreSQL + REST API)             │
│           https://xxxxx.supabase.co                  │
│                 (Cloud Database)                     │
│                                                      │
│    Tables: users, mobil, sewa, payments, ...        │
└─────────────────────────────────────────────────────┘
```

---

## 💡 Pro Tips

1. **Use .env.example as template:**
   - Copy `.env.example` to `.env`
   - Edit `.env` dengan actual values
   - Never commit `.env` ke git

2. **Keep SUPABASE_KEY safe:**
   - This is your database credential
   - Don't share publicly
   - Consider rotating periodically

3. **Test regularly:**
   - Create test data via API
   - Check in Supabase dashboard
   - This confirms everything working

4. **Monitor Supabase usage:**
   - Free tier has limits
   - Check pricing page for details
   - Set up alerts if needed

---

## 📖 Reference Documentation

### **In This Project:**
- `SUPABASE_SETUP.md` - Detailed setup guide
- `SUPABASE_QUICK_START.md` - 5-minute quick start
- `Backend/.env.example` - Backend config template
- `Frontend/.env.example` - Frontend config template
- `Backend/database.sql` - Database schema

### **External Resources:**
- Official Supabase Docs: https://supabase.com/docs
- Supabase JS Client: https://github.com/supabase/supabase-js
- PostgreSQL Documentation: https://postgresql.org/docs

---

## ✨ Next Steps

1. **Immediate (Do First):**
   - Setup Supabase account
   - Create project & get API keys
   - Create .env files
   - Run `npm run dev` in both folders

2. **After Verification:**
   - Test user registration via API
   - Setup admin account if needed
   - Configure Midtrans (if using payments)
   - Setup email notifications (if using nodemailer)

3. **Before Production:**
   - Enable Row Level Security (RLS)
   - Setup proper authentication policies
   - Configure CORS origins
   - Setup monitoring & backups
   - Test payment flow end-to-end

---

## ❓ Still Need Help?

Check documentation in this order:
1. `SUPABASE_QUICK_START.md` (quick overview)
2. `SUPABASE_SETUP.md` → Troubleshooting section
3. Supabase Discord: https://discord.supabase.io
4. GitHub Issues: https://github.com/supabase/supabase

---

**Configuration Date:** April 2026  
**Status:** ✅ Complete  
**Last Updated:** Today
