-- Retake rules: one attempt per week per day; after a second fail on the same week, the week locks until a
-- reviewer/admin unlocks it. Each unlock is recorded here; fails are counted from the latest unlock.
CREATE TABLE week_unlocks (
  id           SERIAL PRIMARY KEY,
  trainee_id   INTEGER NOT NULL REFERENCES trainees(id),
  track        TEXT NOT NULL CHECK (track IN ('1926', '1910')),
  week         INTEGER NOT NULL,
  unlocked_by  INTEGER NOT NULL REFERENCES staff_users(id),
  unlocked_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX week_unlocks_trainee_week ON week_unlocks (trainee_id, track, week);
