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
    // 1. Create HTTP Server
    const httpServer = http.createServer(app);

    // 2. Initialize Socket.IO
    initSocket(httpServer);

    // 3. Listen immediately on 0.0.0.0 so Render detects port binding and health check passes instantly
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`===============================================`);
      console.log(`🚀 HackMate Server running on port ${PORT}`);
      console.log(`📡 Real-time Socket.IO active`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health Check: http://localhost:${PORT}/api/v1/health`);
      console.log(`📚 API Docs: http://localhost:${PORT}/api/v1/docs`);
      console.log(`===============================================`);
    });

    // 4. Connect Database & initialize jobs
    connectDB()
      .then(async () => {
        startDeadlineCron();
        try {
          const User = (await import('./models/User.js')).default;
          const userCount = await User.countDocuments();
          if (userCount === 0) {
            console.log('[Auto-Seed] Database is connected but empty. Seeding initial demo dataset...');
            const { seedDatabase } = await import('./utils/seeder.js');
            await seedDatabase(false);
            console.log('[Auto-Seed] Initial demo data seeded successfully!');
          } else {
            console.log(`[Database] Found ${userCount} registered users in database.`);
          }
        } catch (seedErr) {
          console.warn(`[Auto-Seed Notice] Could not run auto-seed: ${seedErr.message}`);
        }
      })
      .catch((err) => {
        console.error(`[Database Warning] Initial connection delayed: ${err.message}`);
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
