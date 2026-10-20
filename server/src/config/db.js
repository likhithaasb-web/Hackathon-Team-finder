import mongoose from 'mongoose';
import dns from 'dns';

// Only set custom DNS fallback on Windows (Render Linux containers use system resolv.conf)
if (process.platform === 'win32') {
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
  } catch (e) {
    // Ignore if not permitted
  }
}

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hackmate';
  const sanitized = uri.includes('@') ? uri.replace(/:([^:@]+)@/, ':****@') : uri;
  console.log(`[Database] Attempting connection to: ${sanitized}`);
  try {
    const conn = await mongoose.connect(uri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 15000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    throw error;
  }
};
