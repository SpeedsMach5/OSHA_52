# OSHA 52 API

Node/Express API on Railway, backed by the project's Railway Postgres. It serves the verified content in `../data/osha1926.json` and `../data/osha1910.json` (the only content source), grades tests on the server (pass mark 80%), and stores trainees, staff, every attempt, and every answer.

## Environment variables (Railway service "OSHA 52 API")

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Reference to the existing Postgres: `${{Postgres.DATABASE_URL}}` |
| `JWT_SECRET` | Random secret, at least 32 characters, used to sign login tokens |
| `ADMIN_NAME`, `ADMIN_EMAIL` | Admin account created by the seed step |
| `ADMIN_INITIAL_PASSWORD` | Initial admin password. The admin must change it at first login. The seed never overwrites an existing account. |
| `CORS_ORIGINS` | Comma-separated allowed browser origins. Set to the Cloudflare Pages domain once it exists. |
| `APP_BASE_URL` | Frontend base URL, used to build reviewer invite links (`<APP_BASE_URL>/invite/<token>`) |
| Optional | `PASS_MARK` (80), `TRAINEE_TOKEN_TTL` (14d), `STAFF_TOKEN_TTL` (12h), `INVITE_TTL_HOURS` (168), `LOGIN_RATE_LIMIT_PER_MINUTE` (20) |

## Deploy

These settings are stored on the Railway service. Railway no longer accepts `railway.json` (config-as-code is deprecated).

- Root directory: `OSHA_52`.
- Builder: Railpack.
- Pre-deploy: `npm run migrate && npm run seed:admin`. Migrations are idempotent and take an advisory lock. The seed is skipped if the admin exists.
- Start: `npm start`.
- Health check: `GET /health`.
- `/.railwayignore` (repo root) keeps the legacy files and Phase 1 working material out of CLI uploads.

## Local

```
npm install          # from OSHA_52/
npm test             # 28 end-to-end tests on an in-process Postgres (PGlite); no external DB needed
```

## Endpoints

**Auth**
- `POST /auth/trainee/register` `{name, pin}`: a first-time trainee chooses a 4-digit PIN.
- `POST /auth/trainee/login` `{name, pin}`. After a PIN reset this returns 409 `pin_reset_required`.
- `POST /auth/trainee/reset-pin` `{name, code, pin}`: the 6-digit one-time code from a reviewer, plus the new PIN.
- `POST /auth/staff/login` `{email, password}` returns `mustChangePassword`.
- `POST /auth/staff/change-password` `{currentPassword, newPassword}`: the only route allowed while a password change is pending.
- `GET /auth/invite/:token` returns `{kind}`, which is `invite` or `password_reset`.
- `POST /auth/invite/accept` `{token, password}`: a one-time link, consumed on use.
- `POST /auth/logout`: ends the account's sessions on the server.
- `GET /me`

**Content** (any signed-in user)
- `GET /tracks`
- `GET /tracks/:track/weeks` (with the trainee's progress)
- `GET /tracks/:track/weeks/:week`
- `GET /tracks/:track/weeks/:week/test`: questions and options only, in a fresh random question and option order each time, plus `attemptToken`.

**Attempts** (trainee)
- `POST /tracks/:track/weeks/:week/attempts` `{answers: [displayedOptionIndex, ...], attemptToken}`:
  - Graded on the server. Each served test can be submitted once.
  - Pass: every question shows the correct option, explanation and citation.
  - Fail: shows which questions were missed and the citation for each, but not the correct option or explanation.
- `GET /me/attempts` and `GET /me/attempts/:id`: the same pass/fail rule, in the order the trainee saw.

**Staff** (reviewer, admin)
- `GET /staff/trainees`
- `POST /staff/trainees/:id/reset-pin`: returns a 6-digit `code`, valid for 24 hours and shown once, to give to the trainee in person.

**Admin**
- `POST /admin/trainees/:id/deactivate` and `/reactivate`
- `GET /admin/reviewers`
- `POST /admin/reviewers/invite` `{name, email}`: returns a one-time invite link.
- `POST /admin/reviewers/:id/revoke`
- `POST /admin/reviewers/:id/reinvite`
- `POST /admin/reviewers/:id/reset-password`: for an active reviewer. The old password and sessions stop working, and the admin gets a one-time reset link.

Reviewer results, CSV export, and PDF records are Stage C.
