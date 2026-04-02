# 🌐 Domain Setup Guide: ragiltrans.com

**Registrar**: Hostinger  
**Platform**: Vercel (Frontend) + Railway (Backend)  
**Structure**:
- `ragiltrans.com` → Frontend
- `api.ragiltrans.com` → Backend

---

## 📋 Pre-Setup Checklist

- [ ] Domain `ragiltrans.com` sudah di Hostinger
- [ ] Backend sudah deployed di Railway (dapat URL)
- [ ] Frontend sudah deployed di Vercel (dapat URL)
- [ ] Akses ke Hostinger admin panel siap
- [ ] Akses ke Vercel dashboard siap
- [ ] Akses ke Railway dashboard siap

---

## 🚀 Step 1: Deploy Backend & Frontend (Jika belum)

### Deploy Backend ke Railway
1. Go to [railway.app](https://railway.app)
2. Connect GitHub → select repo
3. Root directory: `Backend/`
4. Add environment variables (dari `.env.production`)
5. Deploy ✅
6. **Copy Railway URL** (format: `https://xxx.railway.app`)

### Deploy Frontend ke Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repo
3. Root directory: `Frontend/`
4. Add env variable: `VITE_API_URL=https://xxx.railway.app` (dari Railway)
5. Deploy ✅
6. **Copy Vercel URL** (format: `https://xxx.vercel.app`)

---

## 🔧 Step 2: Setup di Vercel (Frontend Domain)

### 2.1 Add Domain di Vercel
1. Go to [vercel.com](https://vercel.com)
2. Select your project → Settings
3. Go to "Domains" tab
4. Click "Add Domain"
5. Type: `ragiltrans.com`
6. Click "Add"

### 2.2 Vercel akan menunjukkan DNS records

**Important:** Catat DNS records yang ditampilkan Vercel!

Vercel akan kasih pilihan:
- **Option A**: Gunakan Nameservers (lebih mudah)
- **Option B**: Manual DNS records (CNAME/A)

**Kami akan gunakan CNAME (Option B) untuk Hostinger compatibility.**

Vercel kasih records seperti:
```
Type: CNAME
Name: ragiltrans.com
Value: cname.vercel-dns.com
```

**Save ini untuk step 4 (Hostinger DNS setup)**

---

## 🔧 Step 3: Setup di Railway (Backend Domain)

### 3.1 Add Domain di Railway
1. Go to [railway.app](https://railway.app)
2. Select your backend deployment
3. Go to "Settings" → "Domain"
4. Click "Add Domain"
5. Type: `api.ragiltrans.com`
6. Click "Add"

### 3.2 Railway akan menunjukkan DNS records

**Catat DNS records dari Railway juga!**

Railway kasih something like:
```
Type: CNAME
Name: api.ragiltrans.com
Value: something.railway.app
```

**Save ini untuk step 4 (Hostinger DNS setup)**

---

## 🌐 Step 4: Configure DNS di Hostinger

Ini adalah **bagian paling penting**!

### 4.1 Login to Hostinger
1. Go to [hostinger.com](https://hostinger.com)
2. Login ke account
3. Go to "My Domains"
4. Click `ragiltrans.com`
5. Click "Manage" atau "DNS/Nameservers"

### 4.2 Find DNS Management

Di Hostinger, cari:
- **"DNS Zone"** atau
- **"DNS Records"** atau  
- **"Nameservers"**

(Biasanya di dalam Dashboard domain)

### 4.3 Add DNS Records untuk Vercel (Frontend)

**Setup CNAME record untuk root domain:**

Di Hostinger DNS Zone, add record:

| Field | Value |
|-------|-------|
| Type | **CNAME** |
| Name | @ (or leave blank for root) |
| Value | **cname.vercel-dns.com** |
| TTL | 3600 |

**⚠️ PENTING**: Beberapa registrar tidak bisa CNAME di root domain (@)

**Alternatif jika error:**

Gunakan **A record** dengan IP Vercel:
| Field | Value |
|-------|-------|
| Type | **A** |
| Name | @ |
| Value | **76.76.19.89** |
| TTL | 3600 |

### 4.4 Add DNS Records untuk Railway (Backend)

**Setup CNAME record untuk subdomain api:**

| Field | Value |
|-------|-------|
| Type | **CNAME** |
| Name | **api** |
| Value | **(dari Railway dashboard)** |
| TTL | 3600 |

**Contoh:**
```
Type: CNAME
Name: api
Value: api-prod-xyz.railway.app
TTL: 3600
```

### 4.5 Verify Setup di Hostinger

After adding records, Hostinger akan tampil:

```
@ (or ragiltrans.com)  →  A/CNAME  →  vercel/railway value
api.ragiltrans.com     →  CNAME   →  railway value
www.ragiltrans.com     →  CNAME   →  cname.vercel-dns.com (optional)
```

---

## ✅ Step 5: Verify Domain Configuration

### 5.1 Check DNS Propagation (1-3 jam)

Wait 5-10 minutes, then check:

```bash
# Check Vercel (Frontend)
nslookup ragiltrans.com
# Should return Vercel IP or CNAME

# Check Railway (Backend)
nslookup api.ragiltrans.com
# Should return Railway nameserver
```

Or use online tool:
- https://mxtoolbox.com/nslookup.aspx
- https://www.whatsmydns.net/

### 5.2 Verify in Vercel Dashboard

1. Go to Vercel Dashboard
2. Your project → Settings → Domains
3. Look for `ragiltrans.com`
4. Status should change from "Pending" → "Valid" ✅

### 5.3 Verify in Railway Dashboard

1. Go to Railway Dashboard
2. Your backend → Settings → Domain
3. Look for `api.ragiltrans.com`
4. Status should show "Active" or "Connected" ✅

---

## 🧪 Step 6: Test Your Domains

### Test Frontend
```bash
# Should be working after DNS propagates
curl https://ragiltrans.com
# Should return HTML (your Vite app)
```

### Test Backend
```bash
curl https://api.ragiltrans.com/health
# Should return JSON: { success: true, message: "Server running", ... }
```

### Test in Browser
1. Visit `https://ragiltrans.com` (frontend)
2. Open DevTools (F12)
3. Go to Network tab
4. Try login or any API call
5. Check calls to `https://api.ragiltrans.com/api/...`
6. Should get 200 OK responses ✅

---

## 🔐 Step 7: SSL/HTTPS Setup

### Vercel (Auto)
✅ **Automatic** - Vercel handles SSL automatically

### Railway (Auto)
✅ **Automatic** - Railway auto-generates SSL certificate

**Nothing to do!** Both platforms handle HTTPS automatically. Your domain will have 🔒 lock icon.

---

## 📝 Hostinger DNS Records Summary

After completing setup, your Hostinger DNS should look like:

```
+-----------+------+------------------------------+-------+
| Name      | Type | Value                        | TTL   |
+-----------+------+------------------------------+-------+
| @         | A    | 76.76.19.89                  | 3600  |
| api       | CNAME| api-prod-xxxxx.railway.app   | 3600  |
| www       | CNAME| cname.vercel-dns.com         | 3600  |
+-----------+------+------------------------------+-------+
```

---

## 🚨 Common Issues & Solutions

### Issue: Domain shows Vercel default page
**Solution**: 
1. Check DNS propagation (wait 1-3 hours)
2. Verify CNAME value is correct in Hostinger
3. Refresh browser cache (Ctrl+Shift+Delete)
4. Wait and try again

### Issue: api.ragiltrans.com returns 404
**Solution**:
1. Verify Railway domain setup is "Active"
2. Check CNAME record for `api` subdomain
3. Make sure backend is still running in Railway
4. Test: `curl https://api.ragiltrans.com/health`

### Issue: CORS error from frontend
**Solution**:
1. Go to Railway → Backend variables
2. Update `FRONTEND_URL=https://ragiltrans.com`
3. Restart Railway container
4. Clear browser cache and hard refresh

### Issue: SSL certificate error (mixed content)
**Solution**:
1. Make sure BOTH urls use HTTPS
2. Update `VITE_API_URL=https://api.ragiltrans.com` in Vercel
3. Redeploy frontend

---

## 📊 Expected Timeline

| Step | Time |
|------|------|
| Add domain to Vercel | Instant |
| Add domain to Railway | Instant |
| Add DNS records to Hostinger | Instant |
| DNS propagation | 5 min - 3 hours |
| SSL certificate generation | Automatic |
| Full propagation worldwide | Up to 24 hours |

**Most of the time:** Domain works within 10-30 minutes! 🚀

---

## ✅ Final Verification Checklist

- [ ] Domain `ragiltrans.com` added to Vercel
- [ ] Domain `api.ragiltrans.com` added to Railway
- [ ] DNS records added to Hostinger
- [ ] DNS propagation verified (use nslookup)
- [ ] Vercel dashboard shows "Valid" status
- [ ] Railway dashboard shows "Active" status
- [ ] `https://ragiltrans.com` loads frontend ✅
- [ ] `https://api.ragiltrans.com/health` returns 200 ✅
- [ ] Frontend can call backend API without CORS error
- [ ] SSL certificate shows 🔒 lock icon
- [ ] Payment/booking features work

**All checked? 🎉 Your domain is live!**

---

## 📞 Hostinger Support

Jika ada masalah di Hostinger:
1. Go to Hostinger Dashboard
2. Help → Live Chat / Support
3. Mention: "Setup DNS CNAME records for Vercel and Railway"

**Hostinger usually responds within 1 hour!**

---

## 🔄 Next: Update Environment Variables

After domain is live, update these:

### In Railway (Backend)
```
FRONTEND_URL=https://ragiltrans.com
GOOGLE_CALLBACK_URL=https://api.ragiltrans.com/api/auth/google/callback
```

### In Vercel (Frontend)
```
VITE_API_URL=https://api.ragiltrans.com
```

Then redeploy both platforms! ✅

---

**Questions? Check Hostinger support or Railway/Vercel docs!** 🚀
