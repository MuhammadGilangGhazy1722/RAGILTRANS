# 🔐 Environment Variables Quick Reference

## Backend (Railway)

### Required Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `production` |
| `SUPABASE_URL` | Database URL | `https://xxx.supabase.co` |
| `SUPABASE_KEY` | Database key | `eyJxxx...` |
| `JWT_SECRET` | JWT signing key | Random 32 char string |
| `FRONTEND_URL` | Frontend domain | `https://app.vercel.app` |
| `MIDTRANS_SERVER_KEY` | Payment API key | `Mid-xxx-xxx` |
| `MIDTRANS_CLIENT_KEY` | Payment client key | `Mid-xxxx-xxxx` |
| `MIDTRANS_IS_PRODUCTION` | Production mode | `true` |

### Optional Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `GOOGLE_CLIENT_ID` | Google OAuth ID | - |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | - |
| `GOOGLE_CALLBACK_URL` | OAuth callback | `/api/auth/google/callback` |
| `EMAIL_HOST` | Email server | `smtp.gmail.com` |
| `EMAIL_USER` | Email address | - |
| `EMAIL_PASSWORD` | Email password | - |

---

## Frontend (Vercel)

### Required Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://your-railway-app.railway.app` |
| `VITE_NODE_ENV` | Environment | `production` |

---

## 🔑 How to Generate Secrets

### JWT Secret
```bash
# Run in terminal (macOS/Linux)
openssl rand -hex 32

# Or with Node.js (all platforms)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Output
```
a7f3b2c1d9e8f4a6b5c2d1e9f8a7b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8
```

Copy this value to Railway → Backend Variables → `JWT_SECRET`

---

## 📝 Setup Checklist

### Before Deployment

- [ ] **Supabase Credentials**
  - Get from: Supabase Dashboard → Settings → API
  - Copy: `Project URL` and `anon public` key

- [ ] **JWT Secret**
  - Generate using OpenSSL or Node.js
  - Store in Railway safely

- [ ] **Midtrans Keys**
  - Get from: Midtrans Dashboard → Settings → Access Keys
  - Copy: Server Key (for backend only)

- [ ] **Google OAuth**
  - Get from: Google Cloud Console → Credentials
  - Callback URL: `https://your-railway-backend/api/auth/google/callback`

### After Deployment

- [ ] Railway variables set and verified
- [ ] Vercel environment variables set
- [ ] Test health endpoint: `/health`
- [ ] Test API endpoint: `/api/auth/register`
- [ ] CORS errors fixed

---

## ⚠️ Security Guidelines

✅ **DO**:
- Use strong, random passwords
- Store secrets in Railway/Vercel dashboards (NOT in code)
- Use different keys for dev/prod environments
- Rotate secrets every 3-6 months
- Never commit `.env` files

❌ **DON'T**:
- Commit `*.env` or `*.env.local` files
- Share JWT secret or API keys
- Use same key for multiple environments
- Hardcode secrets in source code
- Log sensitive information

---

## 🧪 Testing Endpoints (After Deployment)

### Health Check
```bash
curl https://your-railway-app.railway.app/health
```

### Database Connection
```bash
curl https://your-railway-app.railway.app/
```

### Register Test User
```bash
curl -X POST https://your-railway-app.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@1234",
    "nama": "Test User"
  }'
```

---

## 🚨 Troubleshooting

### Missing Environment Variables Error
**Solution**: Check Railway Dashboard → Variables → make sure all required vars are set

### CORS Error on Frontend
**Solution**: 
1. Check `FRONTEND_URL` in Railway matches Vercel domain
2. Restart Railway container

### Database Connection Error
**Solution**:
1. Verify `SUPABASE_URL` and `SUPABASE_KEY`
2. Check Supabase database is active
3. Check IP whitelist in Supabase

### Payment Not Working
**Solution**:
1. Verify `MIDTRANS_SERVER_KEY` and `MIDTRANS_CLIENT_KEY`
2. Check `MIDTRANS_IS_PRODUCTION=true` (production mode)
3. Check Midtrans test credentials (if in sandbox)

---

## 📞 Reference Links

- **Supabase Config**: https://supabase.com/docs/guides/api/using-api-keys
- **Midtrans Keys**: https://docs.midtrans.com/en/configuration/core-api-configuration
- **Google OAuth**: https://developers.google.com/identity/protocols/oauth2
- **Railway Docs**: https://docs.railway.app/guides/variables
- **Vercel Env Vars**: https://vercel.com/docs/projects/environment-variables
