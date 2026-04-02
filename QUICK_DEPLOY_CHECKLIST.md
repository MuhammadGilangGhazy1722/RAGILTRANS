# 🚀 Quick Deployment Checklist

## Phase 1: Pre-Deployment (Local)

- [ ] **Git Setup**
  - [ ] Push all code to GitHub main branch
  - [ ] Verify GitHub repo has `Backend/` and `Frontend/` folders
  - [ ] Check `.gitignore` excludes `*.env` and `node_modules/`

- [ ] **Environment Preparation**
  - [ ] Generate JWT_SECRET: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
  - [ ] Gather Supabase credentials
  - [ ] Gather Midtrans keys (Production)
  - [ ] Gather Google OAuth credentials

- [ ] **Local Testing**
  - [ ] Backend runs: `npm run dev` (no errors)
  - [ ] Frontend runs: `npm run dev` (no errors)
  - [ ] API endpoints responding
  - [ ] Database connection working

---

## Phase 2: Railway Backend Deployment

### Step 1: Connect GitHub
- [ ] Go to https://railway.app
- [ ] Sign up with GitHub
- [ ] Create new project
- [ ] Select "Deploy from GitHub repo"
- [ ] Authorize Railway access to your repositories
- [ ] Select your repository

### Step 2: Configure
- [ ] Project name: `ragil-trans-backend` (or your choice)
- [ ] Root directory: `Backend`
- [ ] Branch: `main`
- [ ] Wait for initial deployment (ignore if it fails, we'll fix env vars)

### Step 3: Environment Variables (CRITICAL!)
In Railway Dashboard → Variables, add ALL these:

```
PORT=3000
NODE_ENV=production
SUPABASE_URL=<paste your supabase url>
SUPABASE_KEY=<paste your supabase key>
JWT_SECRET=<paste generated secret>
FRONTEND_URL=https://<your-vercel-app>.vercel.app
MIDTRANS_SERVER_KEY=<paste your server key>
MIDTRANS_CLIENT_KEY=<paste your client key>
MIDTRANS_IS_PRODUCTION=true
GOOGLE_CLIENT_ID=<paste your google id>
GOOGLE_CLIENT_SECRET=<paste your google secret>
GOOGLE_CALLBACK_URL=https://<railway-url>/api/auth/google/callback
```

### Step 4: Deploy
- [ ] Save variables
- [ ] Click "Redeploy" or wait for auto-redeploy
- [ ] Wait ~2-3 minutes for deployment
- [ ] Check "Deployments" → Status should be green ✅

### Step 5: Get Backend URL
- [ ] In Railway Dashboard → Domain
- [ ] Copy public URL (format: `https://xxx.railway.app`)
- [ ] Save this URL (needed for Vercel setup)
- [ ] Test: `curl https://your-railway-url/health`

---

## Phase 3: Vercel Frontend Deployment

### Step 1: Connect GitHub
- [ ] Go to https://vercel.com
- [ ] Sign up with GitHub
- [ ] Click "Import Project"
- [ ] Select your GitHub repository
- [ ] Framework Preset: **Vite**
- [ ] Root Directory: **Frontend**

### Step 2: Build Settings
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Install Command: `npm install`

### Step 3: Environment Variables
Add these before deploying:

```
VITE_API_URL=https://your-railway-backend-url.railway.app
VITE_NODE_ENV=production
```

### Step 4: Deploy
- [ ] Click "Deploy"
- [ ] Wait ~3-5 minutes
- [ ] Deployment should complete with ✅
- [ ] Get public URL (format: `https://xxx.vercel.app`)

### Step 5: Test Frontend
- [ ] Visit your Vercel URL
- [ ] Check browser console (F12) for errors
- [ ] Test login page loads
- [ ] Database should be connected

---

## Phase 4: Connect Frontend & Backend

### Step 1: Update Backend CORS
1. [ ] Go to Railway Dashboard
2. [ ] Variables
3. [ ] Update `FRONTEND_URL` to your Vercel domain
4. [ ] Save
5. [ ] Click "Redeploy"
6. [ ] Wait for deployment complete

### Step 2: Verify in Frontend
1. [ ] Go to your Vercel frontend URL
2. [ ] Open browser console (F12)
3. [ ] Look for network requests to `/api/`
4. [ ] Should see successful responses (200 status)

### Step 3: Test API Connection
Try registering a test account:
1. [ ] Click Register
2. [ ] Fill form (email, password, name)
3. [ ] Submit
4. [ ] Check response in browser console
5. [ ] Should see success or validation error (not CORS error)

---

## Phase 5: Testing

### Frontend Testing
- [ ] [ ] Home page loads
- [ ] [ ] Navigation works
- [ ] [ ] Login form displays
- [ ] [ ] Register form works
- [ ] [ ] Logout works
- [ ] [ ] Dashboard loads (if logged in)

### Backend Testing
```bash
# Test health
curl https://your-railway-url/health

# Test database
curl https://your-railway-url/

# Test register
curl -X POST https://your-railway-url/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@1234","nama":"Test"}'
```

### Payment Testing (Midtrans)
- [ ] Use Midtrans test credentials
- [ ] Create test booking
- [ ] Test payment flow in sandbox mode
- [ ] Verify webhook receives payment notification

---

## Phase 6: Post-Deployment

### Monitoring
- [ ] [ ] Set up Railway alerts (optional)
- [ ] [ ] Monitor Vercel analytics dashboard
- [ ] [ ] Check logs regularly for errors

### Optimization
- [ ] [ ] Add custom domain (optional)
- [ ] [ ] Setup SSL certificate
- [ ] [ ] Enable caching on Vercel
- [ ] [ ] Setup database backups on Supabase

### Security
- [ ] [ ] Verify all env vars are set
- [ ] [ ] Check `.env` not committed to git
- [ ] [ ] Enable 2FA on Railway account
- [ ] [ ] Enable 2FA on Vercel account
- [ ] [ ] Rotate JWT_SECRET every 6 months

---

## 🚨 Emergency Contacts / Support

If something fails:

1. **Check Railway Logs**
   ```bash
   railway login
   railway logs
   ```

2. **Check Vercel Logs**
   - Vercel Dashboard → Deployments → Click deployment → Logs

3. **Common Issues**
   - CORS error? Update `FRONTEND_URL` in Railway
   - Database error? Check Supabase credentials
   - Build failed? Check `npm run build` works locally
   - 502 error? Restart Railway container

---

## ✅ Final Verification

After completing all phases:

- [ ] Frontend URL is working
- [ ] Backend health check returns `{ success: true }`
- [ ] CORS errors are gone
- [ ] API responds to requests
- [ ] Payment gateway is connected
- [ ] Database operations work
- [ ] No errors in browser console
- [ ] No errors in Railway logs

**If all checked: 🎉 You're live in production!**

---

## 📍 Important URLs to Save

| Service | URL | Purpose |
|---------|-----|---------|
| Railway Dashboard | https://railway.app | Monitor backend |
| Vercel Dashboard | https://vercel.com | Monitor frontend |
| Frontend Live | `https://<your>.vercel.app` | Your application |
| Backend API | `https://<your>.railway.app` | Backend server |
| Supabase | https://supabase.com | Database |
| Midtrans | https://dashboard.midtrans.com | Payments |

---

**Need help?** Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.
