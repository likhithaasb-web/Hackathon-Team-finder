import mongoose from 'mongoose';
import dns from 'dns';

// Improve DNS resolution for cloud SRV records (Atlas)
try {
  dns.setDefaultResultOrder('ipv4first');
  if (process.platform === 'win32') {
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
  }
} catch (e) {
  // Ignore if not permitted
}

// Disable query buffering so disconnected queries fail fast instead of hanging 10 seconds
mongoose.set('bufferCommands', false);

let isConnecting = false;
let reconnectTimer = null;

export const isDbConnected = () => mongoose.connection.readyState === 1;

export const connectDB = async () => {
  if (isDbConnected()) return mongoose.connection;
  if (isConnecting) return null;

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hackmate';
  const sanitized = uri.includes('@') ? uri.replace(/:([^:@]+)@/, ':****@') : uri;
  
  if (process.env.NODE_ENV === 'production' && (uri.includes('127.0.0.1') || uri.includes('localhost'))) {
    console.warn('\n⚠️ [Database Warning] MONGODB_URI is using localhost in a production environment!');
    console.warn('⚠️ On Render, this will fail unless an external MongoDB Atlas cluster URI is provided.\n');
  }

  console.log(`[Database] Attempting connection to: ${sanitized}`);
  isConnecting = true;

  try {
    const conn = await mongoose.connect(uri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000, // Fail fast in 5s rather than 15s or 30s
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    isConnecting = false;
    return conn;
  } catch (error) {
    isConnecting = false;
    console.error(`[Database Error] Connection failed: ${error.message}`);
    scheduleReconnect();
    throw error;
  }
};

export const scheduleReconnect = () => {
  if (reconnectTimer || isDbConnected()) return;
  console.log('[Database] Scheduling reconnection attempt in 5 seconds...');
  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    try {
      await connectDB();
    } catch (err) {
      // Reconnect will be rescheduled by connectDB catch block
    }
  }, 5000);
};

// Listen to disconnection events
mongoose.connection.on('disconnected', () => {
  console.warn('[Database] MongoDB connection dropped. Initiating reconnect...');
  scheduleReconnect();
});

