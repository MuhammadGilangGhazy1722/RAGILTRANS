-- Add OAuth support to users table
USE ragiltrans;

-- Add columns for OAuth authentication
ALTER TABLE users 
ADD COLUMN oauth_provider VARCHAR(50) NULL AFTER password,
ADD COLUMN oauth_id VARCHAR(255) NULL AFTER oauth_provider,
ADD COLUMN profile_picture VARCHAR(255) NULL AFTER oauth_id;

-- Make password nullable for OAuth users
ALTER TABLE users 
MODIFY password VARCHAR(255) NULL;

-- Add index for OAuth lookups
ALTER TABLE users 
ADD INDEX idx_oauth_provider (oauth_provider, oauth_id);

-- Update existing users to have NULL oauth fields (already default, but explicit)
UPDATE users SET oauth_provider = NULL, oauth_id = NULL WHERE oauth_provider IS NULL;
