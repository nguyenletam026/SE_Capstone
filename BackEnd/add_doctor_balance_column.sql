-- Add doctor_balance column to users table
-- This migration adds the doctor_balance column for tracking doctor earnings

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS doctor_balance DOUBLE PRECISION DEFAULT 0.0 NOT NULL;
