require('dotenv').config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { createClient } = require('@supabase/supabase-js');


const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    done(error, data);
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
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('oauth_provider', 'google')
        .eq('oauth_id', profile.id)
        .single();

      if (existingUser) {
        // User sudah login dengan Google ID ini sebelumnya
        return done(null, existingUser);
      }

      // Create new user dengan unique email dari Google
      // Jangan merge dengan user lokal yang sudah exist
      const email = profile.emails[0].value;
      const username = email.split('@')[0] + Math.floor(Math.random() * 10000);
      
      const { data: newUser } = await supabase
        .from('users')
        .insert({
          nama: profile.displayName || email.split('@')[0],
          username: username,
          email: email,
          password: null,  // Google auth tidak butuh password
          no_hp: '',
          oauth_provider: 'google',
          oauth_id: profile.id,
          profile_picture: profile.photos[0]?.value
        })
        .select()
        .single();

      return done(null, newUser);

    } catch (error) {
      return done(error, null);
    }
  }
));

module.exports = passport;