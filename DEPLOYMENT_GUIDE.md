# 🚀 Deployment Guide: Railway (Backend) + Vercel (Frontend)

## 📋 Pre-Deployment Checklist

- [ ] GitHub repository with monorepo structure (Backend/ & Frontend/ folders)
- [ ] Fork/clone project to your GitHub account
- [ ] All sensitive credentials prepared (API keys, secrets, etc.)
- [ ] Tested locally with `npm run dev` for both
- [ ] Database migrations applied to Supabase
- [ ] Environment variables documented

---

## 🔧 Step 1: Setup Railway Backend

### 1.1 Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub account (easiest)
3. Create a new project

### 1.2 Deploy Backend from GitHub
```bash
# Option A: Via Railway CLI (fastest)
npm install -g @railway/cli
railway login
cd Backend
railway init
railway up
```

**Option B: Via Railway Dashboard**
1. Go to Railway Dashboard
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Select the `Backend` folder as root directory
5. Configure environment variables (see: Step 1.3)

### 1.3 Setup Environment Variables in Railway
In Railway Dashboard → Variables:

```
PORT=3000
NODE_ENV=production
SUPABASE_URL=your-supabase-url-here
SUPABASE_KEY=your-supabase-key-here
JWT_SECRET=generate-random-secret-here
FRONTEND_URL=https://your-vercel-app.vercel.app
MIDTRANS_SERVER_KEY=your-production-key
MIDTRANS_CLIENT_KEY=your-production-key
MIDTRANS_IS_PRODUCTION=true
GOOGLE_CLIENT_ID=your-google-id
GOOGLE_CLIENT_SECRET=your-google-secret
GOOGLE_CALLBACK_URL=https://railroad-backend-url/api/auth/google/callback
```

### 1.4 Verify Backend Deployment
```bash
# After deployment, test endpoint
curl https://your-railway-app.railway.app/api/health

# Should return: { success: true }
```

Railway will provide URL like: `https://ragiltrans-backend-production-xxxxx.railway.app`

---

## 🎨 Step 2: Setup Vercel Frontend

### 2.1 Deploy Frontend from GitHub
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "Import Project"
4. Select your GitHub monorepo repository
5. Configure settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `Frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 2.2 Setup Environment Variables in Vercel
In Vercel Dashboard → Settings → Environment Variables:

```
VITE_API_URL=https://your-railway-app.railway.app
VITE_NODE_ENV=production
```

**Important**: Make sure environment variables are set for Production environment!

### 2.3 Deploy
Click "Deploy" and wait ~3-5 minutes for build to complete.

Vercel will provide URL like: `https://ragiltrans.vercel.app`

---

## 🔗 Step 3: Connect Frontend & Backend

### 3.1 Update Frontend API URL
After Railway deployment gives you backend URL:
1. Go to Vercel Dashboard
2. Settings → Environment Variables
3. Update `VITE_API_URL` to your Railway backend URL
4. Redeploy (push new commit or manual redeploy)

### 3.2 Update Backend CORS in Railway
1. Go to Railway Dashboard
2. Variables
3. Update `FRONTEND_URL` to your Vercel domain
4. Restart the application (Container → Restart)

### 3.3 Test Connection
```bash
# Test from frontend calling API
# Check browser console for any CORS errors
# Try: POST to /api/auth/register with test data
```

---

## 🚄 Step 4: Setup Auto-Deployment

### 4.1 Railway Auto-Deploy
✅ **Already enabled** if you connected GitHub
- Any push to `main` branch → auto-redeploy Backend
- Changes only in `Backend/` folder trigger redeploy

### 4.2 Vercel Auto-Deploy
✅ **Already enabled** if you connected GitHub
- Any push to `main` branch → auto-redeploy Frontend
- Changes in `Frontend/` folder trigger redeploy

---

## 🔐 Step 5: Production Secrets Management

### 5.1 Generate Strong JWT Secret
```bash
# Run in terminal (local machine)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy output and paste in Railway Variables → JWT_SECRET
```

### 5.2 Midtrans Production Keys
1. Login to [Midtrans Dashboard](https://dashboard.midtrans.com)
2. Go to Settings → Access Keys
3. Copy Production Keys (Server & Client)
4. Paste in Railway Variables
5. Set `MIDTRANS_IS_PRODUCTION=true`

### 5.3 Google OAuth Production
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. OAuth 2.0 Credentials
3. Add authorized redirect URI:
   ```
   https://your-railway-backend.railway.app/api/auth/google/callback
   ```
4. Copy Client ID & Secret
5. Paste in Railway Variables

---

## 📊 Step 6: Monitoring & Logs

### Railway Logs
```bash
# View live logs
railway logs

# Or via Dashboard: Deployments → View Logs
```

### Vercel Logs
1. Vercel Dashboard → Deployments
2. Click on deployment → Logs tab
3. See build and runtime logs

### Monitor Backend Health
```bash
# Check if API is responding
curl https://your-railway-backend.railway.app/health -v

# Check 200 OK response
```

---

## 🧪 Step 7: Production Testing

### Test Authentication
```bash
curl -X POST https://your-railway-backend.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@gmail.com", "password": "password123"}'
```

### Test Frontend
1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Test login flow
3. Test booking feature
4. Test payment (use Midtrans test credentials)
5. Check browser console for errors

### Monitor Errors
- Railway: Check container logs for backend errors
- Vercel: Check deployment logs for frontend build issues
- Browser Console: Check for frontend runtime errors

---

## 🚨 Common Issues & Solutions

### Issue: CORS Error
**Solution**: 
1. Railway → Variables → Update `FRONTEND_URL` to correct Vercel domain
2. Restart Railway container
3. Clear browser cache (Ctrl+Shift+Delete)

### Issue: Backend timeout 502
**Solution**:
1. Check Railway logs: `railway logs`
2. Verify environment variables are set
3. Check database connection (Supabase)
4. Increase Railway resources if needed

### Issue: Frontend blank page
**Solution**:
1. Check Vercel build logs
2. Verify `VITE_API_URL` is correct
3. Check browser console for errors
4. Redeploy with `git push`

### Issue: Payment not connecting
**Solution**:
1. Verify Midtrans keys in Railway variables
2. Check `MIDTRANS_IS_PRODUCTION=true`
3. Verify test mode in Midtrans dashboard

---

## 📈 Next Steps: Optimization

After successful deployment:

1. **Add Domain Name**
   - Railway: Add custom domain
   - Vercel: Add custom domain via DNS

2. **Setup SSL Certificate**
   - Railway: Auto-managed
   - Vercel: Auto-managed

3. **Enable Performance Monitoring**
   - Add Sentry for error tracking
   - Add logging service

4. **Database Backups**
   - Enable Supabase backups
   - Schedule regular exports

5. **Cost Optimization**
   - Monitor Railway usage
   - Optimize database queries
   - Set up alerts for cost overruns

---

## 📞 Support Links

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Midtrans Docs**: https://docs.midtrans.com

---

## ✅ Final Checklist

- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured
- [ ] CORS working (no errors in browser console)
- [ ] Authentication tested
- [ ] Payment flow tested
- [ ] Database connected
- [ ] SSL/HTTPS working
- [ ] Auto-deploy from GitHub working
- [ ] Monitoring setup complete

**🎉 Your app is live in production!**
