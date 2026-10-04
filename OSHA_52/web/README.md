# OSHA 52 trainee app

Vite + React, phone-first, deployed to Cloudflare Pages. It talks to the OSHA 52 API.

## Build

`VITE_API_URL` must be set to the API address (for example `https://osha-52-api-production.up.railway.app`). The build stops with an error when it's missing, so a production build can't point at localhost by mistake.

Cloudflare Pages settings (Stage D):
- Root directory: `OSHA_52/web`
- Build command: `npm run build`
- Output: `dist`
- Environment variable: `VITE_API_URL`

Deep links (for example `/track/1926/week/3`) are served by Pages' single-page-app fallback.

## Local

```
npm install                                          # from OSHA_52/
npm run dev:api                                      # API on :8787, in-memory Postgres, demo trainees
VITE_API_URL=http://localhost:8787 npm run build:web
npm run preview -w web                               # app on :4173
node web/scripts/screenshots.mjs out/                # phone + desktop screenshots of every screen (uses installed Chrome)
```

Demo trainees: Alex Rivera / 1234 and Sam Patel / 5678. Jordan Lee / 2468 is pending approval.

## Behaviour notes

- The session is kept in `sessionStorage` and ends when the tab closes.
- The app logs out after 30 minutes with no activity.
- Log out ends the session on the server.
- Leaving a test with unsubmitted answers asks first.
- Results follow the API: a pass shows answers, explanations and citations. A fail shows only the missed questions, with citations.
