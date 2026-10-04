const { loadConfig, assertRuntimeConfig } = require('./config');
const { createPgDb } = require('./db');
const { loadContent } = require('./content');
const { createApp } = require('./app');

const cfg = loadConfig();
assertRuntimeConfig(cfg);
const db = createPgDb(cfg);
const content = loadContent();
const app = createApp({ cfg, db, content });

const server = app.listen(cfg.port, () => {
  const tracks = content.listTracks().map(t => `${t.id}: ${t.weekCount} weeks / ${t.questionCount} questions`).join('; ');
  console.log(`OSHA 52 API listening on ${cfg.port} (${tracks}); CORS origins: ${cfg.corsOrigins.join(', ') || '(none)'}`);
});

for (const sig of ['SIGTERM', 'SIGINT']) {
  process.on(sig, () => server.close(() => db.close().finally(() => process.exit(0))));
}
