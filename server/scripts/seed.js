import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import { seedDatabase } from '../src/utils/seeder.js';

try {
  dns.setDefaultResultOrder('ipv4first');
  if (process.platform === 'win32') {
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
  }
} catch (e) {}

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hackmate';

async function run() {
  try {
    const sanitized = MONGODB_URI.includes('@') ? MONGODB_URI.replace(/:([^:@]+)@/, ':****@') : MONGODB_URI;
    console.log(`[Seed CLI] Connecting to MongoDB at ${sanitized}...`);
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('[Seed CLI] Connected successfully.');

    await seedDatabase(true);

    await mongoose.disconnect();
    console.log('[Seed CLI] Disconnected cleanly. Exiting.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed CLI Error]:', error.message);
    process.exit(1);
  }
}

run();
