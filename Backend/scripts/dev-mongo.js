// Dev-only: spin up an ephemeral in-memory MongoDB on the port the backend
// expects (matches MONGODB_URL=mongodb://localhost:27017/bluelearnerhub).
// Use for local hosting / demos when a real mongod isn't installed.
//   node scripts/dev-mongo.js
const { MongoMemoryServer } = require('mongodb-memory-server');

(async () => {
  const server = await MongoMemoryServer.create({
    instance: { port: 27017, dbName: 'bluelearnerhub' },
  });
  console.log('[dev-mongo] in-memory MongoDB ready at', server.getUri());
  const shutdown = async () => { await server.stop(); process.exit(0); };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  setInterval(() => {}, 1 << 30); // keep process alive
})().catch((err) => {
  console.error('[dev-mongo] failed:', err);
  process.exit(1);
});
