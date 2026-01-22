import { createClient } from 'redis';
import env from './env';

const redisClient = createClient({
    socket: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
    },
    password: env.REDIS_PASSWORD || undefined,
});

redisClient.on('error', (error) => {
    console.error('❌ Redis Client Error:', error);
});

redisClient.on('connect', () => {
    console.log('✅ Redis connected successfully');
});

export const connectRedis = async (): Promise<void> => {
    try {
        await redisClient.connect();
    } catch (error) {
        console.warn('⚠️  Redis connection failed (optional):', error);
    }
};

export default redisClient;
