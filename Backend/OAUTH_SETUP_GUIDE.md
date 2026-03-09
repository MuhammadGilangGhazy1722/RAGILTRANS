# OAuth Setup Guide - Google & Facebook Login

## 📋 Prerequisites

1. Node.js installed
2. MySQL database running
3. Google Cloud Console account
4. Facebook Developer account

---

## 🔧 Backend Setup

### 1. Install Required Packages

```bash
cd Backend
npm install passport passport-google-oauth20 passport-facebook
```

### 2. Run Database Migration

Execute the SQL migration to add OAuth support to your database:

```bash
# Using MySQL CLI
mysql -u root -p ragiltrans < add-oauth-support.sql

# Or using your MySQL client (phpMyAdmin, MySQL Workbench, etc.)
```

This migration:
- Adds `oauth_provider` column (google, facebook, null for regular users)
- Adds `oauth_id` column (provider's unique user ID)
- Adds `profile_picture` column
- Makes `password` nullable (not required for OAuth users)

### 3. Configure Environment Variables

Add these variables to your `Backend/.env` file:

```env
# === Existing variables ===
JWT_SECRET=your_jwt_secret_here
PORT=3001

# === URLs ===
BACKEND_URL=http://localhost:3001
FRONTEND_URL=http://localhost:5173

# === Google OAuth ===
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# === Facebook OAuth ===
FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here
```

---

## 🔐 Google OAuth Setup

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 2. Create a New Project (or select existing)
- Click "Select a project" → "New Project"
- Name: `RagilTrans` (or your choice)
- Click "Create"

### 3. Enable Google+ API
- Go to "APIs & Services" → "Library"
- Search for "Google+ API"
- Click "Enable"

### 4. Create OAuth 2.0 Credentials
- Go to "APIs & Services" → "Credentials"
- Click "Create Credentials" → "OAuth client ID"
- Application type: `Web application`
- Name: `RagilTrans Web`

### 5. Add Authorized Redirect URIs
```
http://localhost:3001/api/auth/google/callback
http://localhost:5173/oauth/callback
```

### 6. Copy Credentials
- Copy the `Client ID` → paste in `.env` as `GOOGLE_CLIENT_ID`
- Copy the `Client secret` → paste in `.env` as `GOOGLE_CLIENT_SECRET`

---

## 📘 Facebook OAuth Setup

### 1. Go to Facebook Developers
Visit: https://developers.facebook.com/

### 2. Create an App
- Click "My Apps" → "Create App"
- Use case: "Consumer" (or "Other")
- App name: `RagilTrans`
- Email: your email
- Click "Create App"

### 3. Add Facebook Login Product
- In your app dashboard, find "Facebook Login"
- Click "Set Up"
- Choose "Web"
- Site URL: `http://localhost:5173`
- Click "Save" and "Continue"

### 4. Configure OAuth Settings
- Go to "Facebook Login" → "Settings"
- Add Valid OAuth Redirect URIs:
```
http://localhost:3001/api/auth/facebook/callback
http://localhost:5173/oauth/callback
```
- Save changes

### 5. Copy Credentials
- Go to "Settings" → "Basic"
- Copy `App ID` → paste in `.env` as `FACEBOOK_APP_ID`
- Copy `App Secret` (click "Show") → paste in `.env` as `FACEBOOK_APP_SECRET`

### 6. Make App Public (Optional, for testing)
- Go to "App Mode" (top of dashboard)
- Switch from "Development" to "Live" when ready for production
- For development testing, you can add test users in "Roles" → "Test Users"

---

## ✅ Testing the Setup

### 1. Start Backend
```bash
cd Backend
npm run dev
```

Expected output:
```
✓ Server running on port 3001
✓ Database connected
✓ Passport initialized
```

### 2. Start Frontend
```bash
cd Frontend
npm run dev
```

### 3. Test OAuth Flow

1. Go to `http://localhost:5173/login`
2. Click "Google" or "Facebook" button
3. Authenticate with your account
4. You should be redirected back and logged in automatically

---

## 🔍 Troubleshooting

### Error: "redirect_uri_mismatch"
- **Cause**: Redirect URI not matching
- **Fix**: Ensure the callback URL in your OAuth app settings exactly matches:
  - Google: `http://localhost:3001/api/auth/google/callback`
  - Facebook: `http://localhost:3001/api/auth/facebook/callback`

### Error: "invalid_client"
- **Cause**: Wrong credentials
- **Fix**: Double-check your Client ID/Secret and App ID/Secret in `.env`

### Error: "Cannot read property 'id' of undefined"
- **Cause**: Database migration not run
- **Fix**: Execute `add-oauth-support.sql` migration

### Users can't login after OAuth setup
- **Cause**: Regular users need password, OAuth users don't
- **Fix**: This is normal. OAuth users and regular users can coexist:
  - Regular users: login with username/password
  - OAuth users: login via Google/Facebook buttons

---

## 📊 Database Structure After Migration

### Users Table Fields:
```
- id (INT, PRIMARY KEY)
- nama (VARCHAR)
- username (VARCHAR, UNIQUE)
- email (VARCHAR, UNIQUE)
- password (VARCHAR, **NOW NULLABLE**)
- no_hp (VARCHAR)
- oauth_provider (VARCHAR - 'google', 'facebook', or NULL)
- oauth_id (VARCHAR - provider's user ID)
- profile_picture (VARCHAR - URL to profile image)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

---

## 🎯 OAuth Flow Diagram

```
User clicks "Google/Facebook" button
    ↓
Redirects to OAuth provider (Google/Facebook)
    ↓
User authenticates and grants permissions
    ↓
OAuth provider redirects to: /api/auth/{provider}/callback
    ↓
Backend processes OAuth data:
  - Checks if user exists (by oauth_id)
  - If exists: logs them in
  - If new: creates account
  - Links to existing email if found
    ↓
Backend generates JWT token
    ↓
Redirects to: /oauth/callback?token=...&user=...
    ↓
Frontend stores token and user data
    ↓
User is logged in and redirected to /user/home
```

---

## 🌐 Production Deployment

When deploying to production:

1. **Update environment variables** in `.env`:
```env
BACKEND_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

2. **Update OAuth redirect URIs** in:
   - Google Cloud Console
   - Facebook Developer Dashboard

3. Add production URLs:
```
Google: https://api.yourdomain.com/api/auth/google/callback
Facebook: https://api.yourdomain.com/api/auth/facebook/callback
```

4. **Switch Facebook app to Live mode**

5. **Get Google OAuth verified** (if needed for > 100 users)

---

## 📝 Notes

- OAuth users don't have passwords in the database (password = NULL)
- Profile pictures are stored as URLs from OAuth providers
- Users can have multiple login methods (email + OAuth)
- JWT tokens expire after 7 days
- OAuth flow requires cookies/session handling only during authentication
- After callback, everything uses JWT tokens

---

## 🆘 Support

If you encounter issues:

1. Check browser console for errors
2. Check backend logs
3. Verify all environment variables are set
4. Ensure database migration was successful
5. Test OAuth credentials with provider's testing tools

---

## ✨ Features Implemented

✅ Google OAuth Login/Register
✅ Facebook OAuth Login/Register
✅ Automatic account creation for new OAuth users
✅ Account linking for existing email addresses
✅ Profile picture sync from OAuth provider
✅ JWT token generation for OAuth users
✅ Remember user preferences with localStorage
✅ Seamless redirect flow
✅ Error handling and user feedback

---

**Setup completed! Your app now supports Google and Facebook login. 🎉**
