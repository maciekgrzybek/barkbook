-- Add Cal.com username to salons table for embed prefill functionality
ALTER TABLE salons ADD COLUMN IF NOT EXISTS cal_com_username varchar;

-- Add comment
COMMENT ON COLUMN salons.cal_com_username IS 'Cal.com username for calendar embed (e.g., "johndoe" from cal.com/johndoe)';

