-- Migration to add doctor_schedule_id column to chat_request table
-- This enables tracking which appointment slot was booked for each chat request

ALTER TABLE chat_request 
ADD COLUMN doctor_schedule_id VARCHAR(255);

-- Add foreign key constraint to link chat_request to doctor_schedule
ALTER TABLE chat_request 
ADD CONSTRAINT FK_chat_request_doctor_schedule 
FOREIGN KEY (doctor_schedule_id) REFERENCES doctor_schedule(id);

-- Add index for better query performance
CREATE INDEX idx_chat_request_doctor_schedule_id ON chat_request(doctor_schedule_id);

-- Add comment for documentation
COMMENT ON COLUMN chat_request.doctor_schedule_id IS 'References the doctor schedule slot that was booked for this chat request';
