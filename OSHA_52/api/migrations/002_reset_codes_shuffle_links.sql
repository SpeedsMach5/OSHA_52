-- PIN reset by one-time code: the reviewer/admin gets a 6-digit code (stored hashed, 24 h expiry)
-- and gives it to the trainee in person; the trainee enters it and chooses a new PIN.
ALTER TABLE trainees ADD COLUMN reset_code_hash TEXT;
ALTER TABLE trainees ADD COLUMN reset_code_expires_at TIMESTAMPTZ;

-- Each served test has its own shuffled layout (question and option order); the layout id is
-- recorded on the attempt so one served test can only be submitted once.
ALTER TABLE attempts ADD COLUMN layout_id TEXT;
CREATE UNIQUE INDEX attempts_layout_id_key ON attempts (layout_id) WHERE layout_id IS NOT NULL;

-- Option order as the trainee saw it, per answer (original option indexes in display order).
ALTER TABLE attempt_answers ADD COLUMN display_position INTEGER;
ALTER TABLE attempt_answers ADD COLUMN option_order INTEGER[];

-- One-time links are used for reviewer invites and admin-triggered password resets.
ALTER TABLE invites ADD COLUMN kind TEXT NOT NULL DEFAULT 'invite' CHECK (kind IN ('invite', 'password_reset'));
