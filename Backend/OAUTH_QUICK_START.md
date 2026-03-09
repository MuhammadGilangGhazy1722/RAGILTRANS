# 🚀 Quick Start - OAuth Installation

## Step 1: Install NPM Packages

```bash
cd Backend
npm install passport passport-google-oauth20 passport-facebook
```

## Step 2: Run Database Migration

```bash
# Connect to your MySQL and run:
mysql -u root -p ragiltrans < add-oauth-support.sql
```

Or import `add-oauth-support.sql` using your MySQL client.

## Step 3: Configure Environment Variables

Add these to your `Backend/.env` file:

```env
# URLs
BACKEND_URL=http://localhost:3001
FRONTEND_URL=http://localhost:5173

# Google OAuth (get from https://console.cloud.google.com)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Facebook OAuth (get from https://developers.facebook.com)
FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here
```

## Step 4: Setup OAuth Credentials

### For Google:
1. Go to https://console.cloud.google.com/
2. Create project → Enable Google+ API
3. Create OAuth 2.0 Client ID (Web application)
4. Add redirect URI: `http://localhost:3001/api/auth/google/callback`
5. Copy Client ID and Secret to `.env`

### For Facebook:
1. Go to https://developers.facebook.com/
2. Create App → Add Facebook Login
3. Add OAuth redirect URI: `http://localhost:3001/api/auth/facebook/callback`
4. Copy App ID and Secret to `.env`

## Step 5: Restart Backend

```bash
npm run dev
```

## ✅ Done!

Users can now login with Google and Facebook on the login page.

📖 For detailed guide, see: **OAUTH_SETUP_GUIDE.md**
