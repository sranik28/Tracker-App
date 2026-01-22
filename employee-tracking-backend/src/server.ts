import { createServer } from 'http';
import app from './app';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { initializeSocket } from './sockets';
import env from './config/env';
import activityService from './services/activity.service';

const server = createServer(app);

const startServer = async (): Promise<void> => {
    try {
        await connectDatabase();

        await connectRedis().catch(() => {
            console.warn('⚠️  Running without Redis (caching disabled)');
        });

        initializeSocket(server);

        setInterval(async () => {
            try {
                const count = await activityService.autoOffInactiveSessions();
                if (count > 0) {
                    console.log(`Auto-OFF applied to ${count} inactive sessions`);
                }
            } catch (error) {
                console.error('Error in auto-OFF job:', error);
            }
        }, 5 * 60 * 1000); // Run every 5 minutes

        server.listen(env.PORT, () => {
            console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 Employee Tracking Backend Server Running        ║
║                                                       ║
║   Environment: ${env.NODE_ENV.padEnd(38)}║
║   Port: ${env.PORT.toString().padEnd(45)}║
║   API Version: ${env.API_VERSION.padEnd(38)}║
║                                                       ║
║   Health Check: http://localhost:${env.PORT}/health${' '.repeat(11)}║
║   API Base: http://localhost:${env.PORT}/api/${env.API_VERSION}${' '.repeat(13)}║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
      `);
        });

        process.on('SIGTERM', () => {
            console.log('SIGTERM received, shutting down gracefully');
            server.close(() => {
                console.log('Server closed');
                process.exit(0);
            });
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
