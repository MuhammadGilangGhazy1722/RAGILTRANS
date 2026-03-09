const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const { oauthSuccess, oauthFailure } = require('../controllers/oauth.controller');

// Google OAuth Routes
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/api/auth/oauth/failure',
    session: false 
  }),
  oauthSuccess
);

// OAuth Failure Route
router.get('/oauth/failure', oauthFailure);

module.exports = router;
