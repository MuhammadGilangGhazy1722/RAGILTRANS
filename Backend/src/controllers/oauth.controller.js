const jwt = require('jsonwebtoken');

// OAuth Success Handler - generates JWT and redirects to frontend
exports.oauthSuccess = (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=authentication_failed`);
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        email: user.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Prepare user data
    const userData = {
      id: user.id,
      nama: user.nama,
      username: user.username,
      email: user.email,
      no_hp: user.no_hp,
      profile_picture: user.profile_picture,
      oauth_provider: user.oauth_provider
    };

    // Redirect to frontend with token and user data
    // The frontend will catch these and store them in localStorage
    const redirectUrl = `${process.env.FRONTEND_URL}/oauth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`;
    
    res.redirect(redirectUrl);

  } catch (error) {
    console.error('OAuth Success Error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=token_generation_failed`);
  }
};

// OAuth Failure Handler
exports.oauthFailure = (req, res) => {
  console.error('OAuth Failure:', req.query);
  res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
};
