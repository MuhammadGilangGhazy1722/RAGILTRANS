const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./db');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    done(null, users[0]);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with this Google ID
      const [existingUsers] = await db.query(
        'SELECT * FROM users WHERE oauth_provider = ? AND oauth_id = ?',
        ['google', profile.id]
      );

      if (existingUsers.length > 0) {
        // User exists, return user
        return done(null, existingUsers[0]);
      }

      // Check if email already exists
      const [emailUsers] = await db.query(
        'SELECT * FROM users WHERE email = ?',
        [profile.emails[0].value]
      );

      if (emailUsers.length > 0) {
        // Email exists with different provider, link accounts
        const userId = emailUsers[0].id;
        await db.query(
          'UPDATE users SET oauth_provider = ?, oauth_id = ?, profile_picture = ? WHERE id = ?',
          ['google', profile.id, profile.photos[0]?.value, userId]
        );
        
        const [updatedUser] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
        return done(null, updatedUser[0]);
      }

      // Create new user
      const username = profile.emails[0].value.split('@')[0] + Math.floor(Math.random() * 1000);
      const nama = profile.displayName || profile.emails[0].value.split('@')[0];
      const email = profile.emails[0].value;
      
      const [result] = await db.query(
        `INSERT INTO users (nama, username, email, password, no_hp, oauth_provider, oauth_id, profile_picture) 
         VALUES (?, ?, ?, NULL, '', ?, ?, ?)`,
        [nama, username, email, 'google', profile.id, profile.photos[0]?.value]
      );

      const [newUser] = await db.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
      return done(null, newUser[0]);

    } catch (error) {
      return done(error, null);
    }
  }
));

module.exports = passport;
