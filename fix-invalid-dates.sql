-- Update all "Invalid Date" entries to "TBD" 
UPDATE festival_sessions 
SET day = 'TBD' 
WHERE day = 'Invalid Date';