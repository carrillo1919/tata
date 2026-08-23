import { app } from './app.js';
import { env } from './config/env.js';
import { sequelize } from './config/database.js';
import { syncDb } from './models/index.js';

async function start() {
  try {
    await sequelize.authenticate();
    if (env.dbSync) {
      await syncDb();
    }
    app.listen(env.port, () => {
      console.log(`Tata backend running on port ${env.port}`);
    });
  } catch (error) {
    console.error('Unable to start server', error);
    process.exit(1);
  }
}

start();
