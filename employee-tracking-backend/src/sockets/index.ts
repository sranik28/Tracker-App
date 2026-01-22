import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { verifyAccessToken } from '../utils/jwt.util';
import { ROLES } from '../config/constants';
import env from '../config/env';

let io: SocketIOServer;

export const initializeSocket = (server: HTTPServer): SocketIOServer => {
    io = new SocketIOServer(server, {
        cors: {
            origin: env.ALLOWED_ORIGINS,
            credentials: true,
        },
        transports: ['websocket', 'polling'],
    });

    const adminNamespace = io.of('/admin');

    adminNamespace.use((socket, next) => {
        try {
            const token = socket.handshake.auth.token;

            if (!token) {
                return next(new Error('Authentication token required'));
            }

            const decoded = verifyAccessToken(token);

            if (decoded.role !== ROLES.ADMIN) {
                return next(new Error('Admin access required'));
            }

            (socket as any).user = decoded;
            next();
        } catch (error) {
            next(new Error('Invalid token'));
        }
    });

    adminNamespace.on('connection', (socket) => {
        console.log(`Admin connected: ${socket.id}`);

        socket.on('disconnect', () => {
            console.log(`Admin disconnected: ${socket.id}`);
        });
    });

    console.log('✅ Socket.IO initialized');

    return io;
};

export const getIO = (): SocketIOServer => {
    if (!io) {
        throw new Error('Socket.IO not initialized');
    }
    return io;
};

export default { initializeSocket, getIO };
