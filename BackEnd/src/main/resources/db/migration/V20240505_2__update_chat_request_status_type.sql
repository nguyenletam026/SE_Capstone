-- First, temporarily disable the constraint
ALTER TABLE chat_requests DROP CONSTRAINT IF EXISTS chat_requests_status_check;

-- Update the type definition
DROP TYPE IF EXISTS request_status CASCADE;
CREATE TYPE request_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PAYMENT_REQUIRED');

-- Update the column type
ALTER TABLE chat_requests 
    ALTER COLUMN status TYPE request_status 
    USING status::text::request_status; 