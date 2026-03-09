-- =====================================================
-- Create password_resets table
-- Date: 2026-03-08
-- Purpose: Store password reset tokens for forgot password feature
-- =====================================================

CREATE TABLE IF NOT EXISTS password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_token (token),
  INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Clean up expired tokens (older than 24 hours)
-- Run this periodically or in cron job
-- DELETE FROM password_resets WHERE expires_at < NOW() OR used = TRUE;
