import http from 'http';
import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';
import { initSocket } from './sockets/socketManager.js';
import { startDeadlineCron } from './jobs/deadlineReminder.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect Database
    await connectDB();

    // 2. Create HTTP Server
    const httpServer = http.createServer(app);

    // 3. Initialize Socket.IO
    initSocket(httpServer);

    // 4. Start background jobs
    startDeadlineCron();

    // 5. Listen
    httpServer.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`🚀 HackMate Server running on port ${PORT}`);
      console.log(`📡 Real-time Socket.IO active`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health Check: http://localhost:${PORT}/api/v1/health`);
      console.log(`📚 API Docs: http://localhost:${PORT}/api/v1/docs`);
      console.log(`===============================================`);
    });

    // Graceful shutdown
    const shutdown = () => {
      console.log('\n[Server] Shutting down gracefully...');
      httpServer.close(() => {
        console.log('[Server] Closed remaining connections.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error(`[Server Startup Error]: ${error.message}`);
    process.exit(1);
  }
};

startServer();
