# 🎯 STEP-BY-STEP Deployment & Domain Setup

**Target**: Deploy ke Railway (Backend) + Vercel (Frontend) dengan domain `ragiltrans.com`

---

## 📍 PHASE 1: Preparation (30 menit)

### Step 1.1: Gather Credentials
Di folder project ini, buka terminal dan buat list:

| Item | Value | Status |
|------|-------|--------|
| JWT Secret | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` | ⏳ Generate |
| Supabase URL | Settings → API di supabase.com | ⏳ Copy |
| Supabase Key | Settings → API di supabase.com | ⏳ Copy |
| Midtrans Server Key | Settings → Access Keys (Prod) | ⏳ Copy |
| Midtrans Client Key | Settings → Access Keys (Prod) | ⏳ Copy |
| Google Client ID | Google Cloud Console → Credentials | ⏳ Copy |
| Google Client Secret | Google Cloud Console → Credentials | ⏳ Copy |

✅ **Checklist Phase 1:**
- [ ] Sudah punya semua credentials di atas
- [ ] Semua disimpan di text editor / note app
- [ ] Siap untuk Step 2

---

## 🚀 PHASE 2: Deploy Backend ke Railway (20 menit)

### Step 2.1: Create Railway Project
1. Go to https://railway.app
2. Click "Create New Project"
3. Choose "Deploy from GitHub repo"
4. Click "Connect GitHub" (jika belum)
5. Select your `RagilTransCode` repository
6. Click "Deploy"

### Step 2.2: Configure Backend
1. Railway akan show your project
2. Go to "Settings"
3. Root directory: set ke `Backend/`
4. Wait for auto-deploy to start

### Step 2.3: Add Environment Variables
Di Railway Dashboard:

1. Click "Variables" tab
2. Add ALL ini (copy dari credentials Step 1.1):

```
PORT=3000
NODE_ENV=production
SUPABASE_URL=<paste your supabase url>
SUPABASE_KEY=<paste your supabase key>
JWT_SECRET=<paste generated secret>
FRONTEND_URL=https://ragiltrans.com
MIDTRANS_SERVER_KEY=<paste your server key>
MIDTRANS_CLIENT_KEY=<paste your client key>
MIDTRANS_IS_PRODUCTION=true
GOOGLE_CLIENT_ID=<paste your google id>
GOOGLE_CLIENT_SECRET=<paste your google secret>
GOOGLE_CALLBACK_URL=https://api.ragiltrans.com/api/auth/google/callback
```

3. Click "Save variables"
4. Railway akan auto-redeploy

### Step 2.4: Wait & Verify
1. Go to "Deployments" tab
2. Wait sampai status jadi GREEN ✅ (2-3 menit)
3. Click on deployment → view logs
4. Check no errors
5. Go back to "Domain" or "Settings"
6. **Copy the Railway URL** (format: `https://abc123.railway.app`)
7. Save it somewhere (needed for next step)

✅ **Checklist Phase 2:**
- [ ] Railway project created
- [ ] GitHub connected
- [ ] Backend folder set as root
- [ ] All environment variables added
- [ ] Deployment status is GREEN ✅
- [ ] Railway URL copied & saved

---

## 🎨 PHASE 3: Deploy Frontend ke Vercel (20 menit)

### Step 3.1: Create Vercel Project
1. Go to https://vercel.com
2. Click "Add New..." → "Project"
3. Click "Import Git Repository"
4. Select your `RagilTransCode` repository
5. Click "Import"

### Step 3.2: Configure Project
**Framework Preset:**
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Root Directory: `Frontend/`

(Vercel biasanya auto-detect, tinggal verify)

### Step 3.3: Add Environment Variables
Before deploy, click "Environment Variables" and add:

```
VITE_API_URL=https://abc123.railway.app
```
(Paste Railway URL dari Step 2.4)

### Step 3.4: Deploy
1. Click "Deploy"
2. Wait for build to finish (3-5 menit)
3. Status akan GREEN ✅
4. Go to "Deployments"
5. **Copy the Vercel URL** (format: `https://abc123.vercel.app`)
6. Save it somewhere

### Step 3.5: Test Frontend
1. Visit Vercel URL di browser
2. Open DevTools (F12)
3. Go to Console tab
4. Check no CORS errors
5. Homepage should load ✅

✅ **Checklist Phase 3:**
- [ ] Vercel project created
- [ ] GitHub connected
- [ ] Frontend folder set as root
- [ ] Environment variables added (VITE_API_URL)
- [ ] Build status GREEN ✅
- [ ] Vercel URL copied & saved
- [ ] Frontend loads in browser
- [ ] No CORS errors in console

---

## 🌐 PHASE 4: Setup Domain di Vercel (10 menit)

### Step 4.1: Add Domain to Vercel
1. Go to Vercel Dashboard
2. Select your project
3. Go to "Settings" tab
4. Click "Domains"
5. Under "Production Domains", click "Add Domain"
6. Type: `ragiltrans.com`
7. Click "Add"

### Step 4.2: Vercel akan show DNS instructions
Vercel kasih opsi CNAME records yang perlu di-add

```
Type: CNAME
Name: ragiltrans.com (or @ or left blank)
Value: cname.vercel-dns.com
```

**⚠️ SAVE ini untuk Step 6 (Hostinger DNS)**

Status akan "Pending" sampai DNS di-setup ✅

✅ **Checklist Phase 4:**
- [ ] Domain `ragiltrans.com` added to Vercel
- [ ] DNS instructions saved (copy the CNAME value)
- [ ] Status showing "Pending"

---

## 🔗 PHASE 5: Setup Domain di Railway (10 menit)

### Step 5.1: Add Domain to Railway
1. Go to Railway Dashboard
2. Select your backend deployment
3. Go to "Settings" tab
4. Click "Domain"
5. Click "Add Domain"
6. Type: `api.ragiltrans.com`
7. Click "Add"

### Step 5.2: Railway akan show CNAME record

```
Type: CNAME
Name: api.ragiltrans.com
Value: api-prod-xxxxx.railway.app (or similar)
```

**⚠️ SAVE ini untuk Step 6 (Hostinger DNS)**

✅ **Checklist Phase 5:**
- [ ] Domain `api.ragiltrans.com` added to Railway
- [ ] DNS instructions saved (copy the CNAME value)

---

## 🌍 PHASE 6: Setup DNS di Hostinger (15 menit)

### Step 6.1: Login to Hostinger
1. Go to https://hostinger.com
2. Login dengan akun kamu
3. Go to "My Domains"
4. Click `ragiltrans.com`

### Step 6.2: Find DNS Settings
Cari salah satu:
- "DNS/Nameservers"
- "DNS Zone"
- "DNS Records"
- "Advanced DNS"

(Lokasi berbeda tergantung Hostinger UI)

### Step 6.3: Add DNS Record untuk Frontend (Vercel)

**Add CNAME Record:**

| Field | Value |
|-------|-------|
| Type | CNAME |
| Name | @ (atau kosong, atau ragiltrans.com) |
| Value | cname.vercel-dns.com (dari Step 4.2) |
| TTL | 3600 |

Click "Save" atau "Add Record"

### Step 6.4: Add DNS Record untuk Backend (Railway)

**Add CNAME Record:**

| Field | Value |
|-------|-------|
| Type | CNAME |
| Name | api |
| Value | (dari Step 5.2 - contoh: api-prod-xxxxx.railway.app) |
| TTL | 3600 |

Click "Save" atau "Add Record"

### Step 6.5: Verify Records Added
Di Hostinger, sekarang harus terlihat:

```
@ (ragiltrans.com)  →  CNAME  →  cname.vercel-dns.com
api.ragiltrans.com  →  CNAME  →  api-prod-xxxxx.railway.app
```

✅ **Checklist Phase 6:**
- [ ] Login ke Hostinger berhasil
- [ ] Found DNS management area
- [ ] Added CNAME record untuk @ → Vercel
- [ ] Added CNAME record untuk api → Railway
- [ ] Both records visible di Hostinger
- [ ] Saved / Confirmed

---

## ⏳ PHASE 7: Wait untuk DNS Propagation (5-30 min)

### Step 7.1: DNS Global Update
DNS records butuh waktu untuk spread worldwide:
- Immediate: 5 menit
- Usually works: 10-30 menit
- Fully propagated: 24 jam

**Just wait 10-15 minutes before testing!**

### Step 7.2: Check DNS Status (optional)
Di terminal, run:

```bash
# Check Vercel frontend
nslookup ragiltrans.com

# Check Railway backend
nslookup api.ragiltrans.com
```

Should return IP/CNAME values ✅

Or use: https://mxtoolbox.com/nslookup.aspx

✅ **Checklist Phase 7:**
- [ ] Waited 5-10 minutes
- [ ] DNS records added to Hostinger

---

## 🧪 PHASE 8: Verify & Test (10 menit)

### Step 8.1: Check Vercel Domain Status
1. Go to Vercel Dashboard
2. Your project → Settings → Domains
3. Look at `ragiltrans.com`
4. Status should be "Valid" ✅ (not "Pending")
5. If still "Pending", wait more

### Step 8.2: Check Railway Domain Status
1. Go to Railway Dashboard
2. Your backend → Settings → Domain
3. Look at `api.ragiltrans.com`
4. Status should be "Active" or "Connected" ✅

### Step 8.3: Test Frontend URL
```bash
# In terminal, or just visit in browser
curl https://ragiltrans.com

# Should return your Vue/React app HTML
# Or just visit in browser - should load successfully
```

### Step 8.4: Test Backend Health
```bash
curl https://api.ragiltrans.com/health

# Should return:
# { "success": true, "message": "Server running", ... }
```

### Step 8.5: Test API Connection
1. Visit `https://ragiltrans.com` in browser
2. Open DevTools (F12)
3. Click "Network" tab
4. Try to login or any action
5. Look for requests to `api.ragiltrans.com`
6. Should see 200 OK responses (not CORS error) ✅

✅ **Checklist Phase 8:**
- [ ] Vercel domain status = "Valid"
- [ ] Railway domain status = "Active"
- [ ] `curl https://ragiltrans.com` works
- [ ] `curl https://api.ragiltrans.com/health` returns 200 OK
- [ ] Frontend loads without errors
- [ ] API calls working (no CORS error)

---

## 🔄 PHASE 9: Update Environment Variables (5 menit)

### Step 9.1: Update Railway Backend
1. Go to Railway Dashboard
2. Your backend → Variables
3. Find `FRONTEND_URL`
4. Change from: `https://ragiltrans.com` (already set)
5. Find `GOOGLE_CALLBACK_URL`
6. Change from: old value
7. To: `https://api.ragiltrans.com/api/auth/google/callback`
8. Save
9. Railway auto-redeploys

### Step 9.2: Verify Redeploy
1. Go to "Deployments"
2. Wait for GREEN status ✅

✅ **Checklist Phase 9:**
- [ ] Railway GOOGLE_CALLBACK_URL updated
- [ ] Redeploy status GREEN ✅

---

## 🎉 PHASE 10: Final Testing (10 menit)

### Step 10.1: Feature Testing
1. Visit `https://ragiltrans.com`
2. [ ] Homepage loads
3. [ ] Navigation works
4. [ ] Can click to pages
5. [ ] Try Register → should work
6. [ ] Try Login → should work
7. [ ] Try Logout → should work
8. [ ] Try book a car → should work
9. [ ] Try payment flow → should work

### Step 10.2: Check Logs
**Railway logs:**
```bash
railway login
railway logs
# Should see no errors
```

**Vercel logs:**
1. Vercel Dashboard → Deployments
2. Click latest deployment → Logs
3. Should see no errors

### Step 10.3: Monitor
1. Check Vercel Analytics
2. Check Railway metrics
3. All should be healthy ✅

✅ **Checklist Phase 10:**
- [ ] All pages loading
- [ ] Register works
- [ ] Login works
- [ ] Logout works
- [ ] Booking works
- [ ] Payment gateway works
- [ ] No errors in logs
- [ ] No CORS errors in browser console
- [ ] SSL certificate shows 🔒 lock

---

## ✅ COMPLETION CHECKLIST

**Total Time**: ~2 hours (including wait time)

When all checked, your project is LIVE! 🎉

- [ ] Backend deployed to Railway ✅
- [ ] Frontend deployed to Vercel ✅
- [ ] Domain `ragiltrans.com` pointing to Vercel ✅
- [ ] Domain `api.ragiltrans.com` pointing to Railway ✅
- [ ] Environment variables all set ✅
- [ ] HTTPS working (🔒 lock icon) ✅
- [ ] Frontend loads successfully ✅
- [ ] API calls working ✅
- [ ] Register/Login tested ✅
- [ ] Payment tested ✅
- [ ] No errors in logs ✅
- [ ] No CORS errors ✅

---

## 🆘 TROUBLESHOOTING

### Domain not working (still shows Vercel/Railway default)?
1. Wait 5 more minutes
2. Hard refresh browser (Ctrl+Shift+Delete cache)
3. Check DNS records in Hostinger are correct
4. Check Vercel/Railway domain status
5. Contact Hostinger support if DNS not updating

### API calls returning CORS error?
1. Check `FRONTEND_URL` in Railway = `https://ragiltrans.com`
2. Restart Railway container
3. Check `VITE_API_URL` in Vercel = `https://api.ragiltrans.com`
4. Redeploy frontend

### Backend 502 or timeout error?
1. Check Railway logs: `railway logs`
2. Verify environment variables all set
3. Check Supabase connection
4. Restart Railway container

### SSL certificate warning?
1. Check BOTH URLs use HTTPS (not HTTP)
2. Clear browser cache
3. Wait for certificate propagation (5 min)

---

## 📞 NEED HELP?

**If stuck somewhere:**
1. Note which PHASE you're in
2. Share what error you see
3. Share screenshot if possible
4. I'll help you fix it! 🚀

---

**Ready? Start from PHASE 1 Step 1.1** 👇

1. Gather credentials
2. Deploy backend (Railway)
3. Deploy frontend (Vercel)
4. Setup domain (Vercel, Railway, Hostinger)
5. Wait for DNS
6. Test everything
7. Update final variables
8. Done! 🎉
