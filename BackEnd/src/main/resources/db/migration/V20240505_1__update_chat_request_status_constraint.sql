-- First drop the existing constraint
ALTER TABLE chat_requests DROP CONSTRAINT IF EXISTS chat_requests_status_check;

-- Add the constraint back with the new status
ALTER TABLE chat_requests
    ADD CONSTRAINT chat_requests_status_check
    CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'PAYMENT_REQUIRED')); 