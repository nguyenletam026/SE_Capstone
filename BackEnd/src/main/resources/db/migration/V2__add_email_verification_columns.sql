-- Add verification_token column if it doesn't exist
ALTER TABLE IF NOT EXISTS users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255);

-- Add verification_token_expiry column if it doesn't exist
ALTER TABLE IF NOT EXISTS users ADD COLUMN IF NOT EXISTS verification_token_expiry TIMESTAMP;

-- Add email_verified column if it doesn't exist
ALTER TABLE IF NOT EXISTS users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN;

-- Update existing users to have email_verified set to true
UPDATE users SET email_verified = true WHERE email_verified IS NULL; 