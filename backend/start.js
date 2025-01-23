import { config } from 'dotenv';
config();
import mongoose from 'mongoose';
import app from './app';
import path from 'path';
import fs from 'fs';
import cron from 'node-cron';
import * as redis from "./helpers/redis";

const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.DATABASE, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 50000,
    });
    console.log('-> Connected to MongoDB');
  } catch (error) {
    console.log(`-> MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

//mongoose.set('debug', process.env.NODE_ENV === 'local');


const connectToRedis = async () => {
  try {
    await redis.createConnection(process.env.REDIS);
  } catch (error) {
    console.log(`-> Redis connection error: ${error.message}`);
    process.exit(1);
  }
};

const initializeCronJobs = () => {
  if (process.env.CRON === '1') {
    const cronPath = path.join(path.resolve(), 'crons');

    fs.readdirSync(cronPath).forEach(async (file) => {
      try {
        const { default: cronInfo } = await import(`${cronPath}/${file}`);
        if (cronInfo && cronInfo.expression && typeof cronInfo.func === 'function') {
          cron.schedule(cronInfo.expression, async () => {
            try {
              await cronInfo.func();
            } catch (e) {
              console.log(`Error in cron (${file}):`, e.message);
            }
          });
        } else {
          console.log(`Invalid cron job format in file: ${file}`);
        }
      } catch (e) {
        console.log(`Failed to load cron job from file (${file}):`, e.message);
      }
    });
  }
};

const startServer = () => {
  const port = process.env.PORT || 7777;
  app.set('port', port);
  app.listen(port, () => {
    console.log(`Express server running on port ${port}`);
  });
};

(async () => {
  await connectToDatabase();
  await connectToRedis();
  initializeCronJobs();
  startServer();
})();
