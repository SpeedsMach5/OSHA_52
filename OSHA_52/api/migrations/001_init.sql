-- Staff accounts: the admin (seeded) and reviewers (invited by the admin).
CREATE TABLE staff_users (
  id                    SERIAL PRIMARY KEY,
  name                  TEXT        NOT NULL,
  email                 TEXT        NOT NULL UNIQUE,           -- stored lower-case
  role                  TEXT        NOT NULL CHECK (role IN ('admin', 'reviewer')),
  password_hash         TEXT,                                  -- NULL until an invited reviewer sets one
  must_change_password  BOOLEAN     NOT NULL DEFAULT FALSE,
  status                TEXT        NOT NULL DEFAULT 'active' CHECK (status IN ('invited', 'active', 'revoked')),
  failed_logins         INTEGER     NOT NULL DEFAULT 0,
  locked_until          TIMESTAMPTZ,
  token_version         INTEGER     NOT NULL DEFAULT 0,        -- bump to invalidate issued tokens
  created_by            INTEGER     REFERENCES staff_users(id),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One-time reviewer invite links. Only a hash of the token is stored.
CREATE TABLE invites (
  id             SERIAL PRIMARY KEY,
  staff_user_id  INTEGER     NOT NULL REFERENCES staff_users(id) ON DELETE CASCADE,
  token_hash     TEXT        NOT NULL UNIQUE,
  expires_at     TIMESTAMPTZ NOT NULL,
  used_at        TIMESTAMPTZ,
  revoked_at     TIMESTAMPTZ,
  created_by     INTEGER     REFERENCES staff_users(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trainees log in with name + 4-digit PIN (hashed). pin_hash is NULL for a new or reset account
-- until the trainee sets a PIN.
CREATE TABLE trainees (
  id             SERIAL PRIMARY KEY,
  name           TEXT        NOT NULL,
  name_key       TEXT        NOT NULL UNIQUE,                  -- normalized lower-case name
  pin_hash       TEXT,
  active         BOOLEAN     NOT NULL DEFAULT TRUE,
  failed_logins  INTEGER     NOT NULL DEFAULT 0,
  locked_until   TIMESTAMPTZ,
  token_version  INTEGER     NOT NULL DEFAULT 0,
  pin_set_at     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Every submitted test is kept (retakes allowed).
CREATE TABLE attempts (
  id               SERIAL PRIMARY KEY,
  trainee_id       INTEGER      NOT NULL REFERENCES trainees(id),
  track            TEXT         NOT NULL CHECK (track IN ('1926', '1910')),
  week             INTEGER      NOT NULL,
  question_count   INTEGER      NOT NULL,
  correct_count    INTEGER      NOT NULL,
  score_pct        NUMERIC(5,2) NOT NULL,
  passed           BOOLEAN      NOT NULL,
  pass_mark        NUMERIC(5,2) NOT NULL,
  content_version  TEXT         NOT NULL,                      -- hash of the week's test content when graded
  submitted_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX attempts_trainee_idx   ON attempts (trainee_id, track, week);
CREATE INDEX attempts_submitted_idx ON attempts (submitted_at);
CREATE INDEX attempts_track_week_idx ON attempts (track, week);

-- Each answer within an attempt.
CREATE TABLE attempt_answers (
  attempt_id      INTEGER NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  question_index  INTEGER NOT NULL,                            -- 0-based position in the week's test
  question_key    TEXT    NOT NULL,                            -- e.g. 1926-w12-q3
  selected_index  INTEGER NOT NULL,
  correct_index   INTEGER NOT NULL,
  is_correct      BOOLEAN NOT NULL,
  PRIMARY KEY (attempt_id, question_index)
);
CREATE INDEX attempt_answers_key_idx ON attempt_answers (question_key);

-- Security-relevant actions (PIN resets, invites, revocations, password changes, ...).
CREATE TABLE audit_log (
  id           SERIAL PRIMARY KEY,
  actor_type   TEXT        NOT NULL,                           -- 'staff' | 'trainee' | 'system'
  actor_id     INTEGER,
  action       TEXT        NOT NULL,
  target_type  TEXT,
  target_id    INTEGER,
  detail       JSONB,
  at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
