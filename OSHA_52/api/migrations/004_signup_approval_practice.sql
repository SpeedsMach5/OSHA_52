-- New trainee sign-ups wait for a reviewer/admin to approve or reject them. Existing trainees are approved.
ALTER TABLE trainees ADD COLUMN approval TEXT NOT NULL DEFAULT 'approved' CHECK (approval IN ('pending', 'approved', 'rejected'));
ALTER TABLE trainees ALTER COLUMN approval SET DEFAULT 'pending';
ALTER TABLE trainees ADD COLUMN approval_decided_by INTEGER REFERENCES staff_users(id);
ALTER TABLE trainees ADD COLUMN approval_decided_at TIMESTAMPTZ;

-- Attempts on a week the trainee has already passed are practice: kept in history, but they don't count
-- toward the lock and don't change the week's pass status.
ALTER TABLE attempts ADD COLUMN practice BOOLEAN NOT NULL DEFAULT FALSE;
