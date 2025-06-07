-- Fix refund fields in chat_payments table
-- This script handles the database schema migration for refund functionality

-- First, check if refunded column exists and add it if necessary
DO $$
BEGIN
    -- Add refunded column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'chat_payments' AND column_name = 'refunded') THEN
        ALTER TABLE chat_payments ADD COLUMN refunded BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added refunded column';
    ELSE
        RAISE NOTICE 'refunded column already exists';
    END IF;
    
    -- Add refund_amount column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'chat_payments' AND column_name = 'refund_amount') THEN
        ALTER TABLE chat_payments ADD COLUMN refund_amount DOUBLE PRECISION;
        RAISE NOTICE 'Added refund_amount column';
    ELSE
        RAISE NOTICE 'refund_amount column already exists';
    END IF;
    
    -- Add refund_reason column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'chat_payments' AND column_name = 'refund_reason') THEN
        ALTER TABLE chat_payments ADD COLUMN refund_reason VARCHAR(500);
        RAISE NOTICE 'Added refund_reason column';
    ELSE
        RAISE NOTICE 'refund_reason column already exists';
    END IF;
    
    -- Add refunded_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'chat_payments' AND column_name = 'refunded_at') THEN
        ALTER TABLE chat_payments ADD COLUMN refunded_at TIMESTAMP;
        RAISE NOTICE 'Added refunded_at column';
    ELSE
        RAISE NOTICE 'refunded_at column already exists';
    END IF;
END
$$;

-- Update all existing records to have refunded = false if they are null
UPDATE chat_payments SET refunded = false WHERE refunded IS NULL;

-- Now make the refunded column NOT NULL
ALTER TABLE chat_payments ALTER COLUMN refunded SET NOT NULL;

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'chat_payments' 
  AND column_name IN ('refunded', 'refund_amount', 'refund_reason', 'refunded_at')
ORDER BY column_name;
