-- Add doctor_balance column to users table
-- Migration script to add doctor_balance for tracking doctor earnings

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS doctor_balance DOUBLE PRECISION DEFAULT 0.0 NOT NULL;
