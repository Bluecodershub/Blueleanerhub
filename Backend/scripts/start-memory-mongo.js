const { MongoMemoryServer } = require('mongodb-memory-server');

async function main() {
  const mongod = await MongoMemoryServer.create({
    instance: {
      port: 27017,
      dbName: 'bluelearnerhub',
      storageEngine: 'wiredTiger',
    },
  });

  console.log(`MongoMemoryServer listening at ${mongod.getUri()}`);

  const shutdown = async () => {
    await mongod.stop();
    process.exit(0);
  };

  process.on('SIGINT', () => {
    console.log('Ignoring SIGINT; send SIGTERM to stop MongoMemoryServer.');
  });
  process.on('SIGTERM', shutdown);
  setInterval(() => {}, 1 << 30);
}

main().catch((error) => {
  console.error('Failed to start MongoMemoryServer', error);
  process.exit(1);
});
