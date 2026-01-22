import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
    NODE_ENV: string;
    PORT: number;
    API_VERSION: string;
    MONGODB_URI: string;
    MONGODB_POOL_SIZE: number;
    REDIS_HOST: string;
    REDIS_PORT: number;
    REDIS_PASSWORD: string;
    JWT_ACCESS_SECRET: string;
    JWT_REFRESH_SECRET: string;
    JWT_ACCESS_EXPIRY: string;
    JWT_REFRESH_EXPIRY: string;
    LOCATION_DISTANCE_THRESHOLD: number;
    LOCATION_TIME_THRESHOLD: number;
    AUTO_OFF_TIMEOUT: number;
    TIMEZONE: string;
    RATE_LIMIT_WINDOW: number;
    RATE_LIMIT_MAX_REQUESTS: number;
    ALLOWED_ORIGINS: string[];
}

const env: EnvConfig = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '5000', 10),
    API_VERSION: process.env.API_VERSION || 'v1',
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/employee-tracking',
    MONGODB_POOL_SIZE: parseInt(process.env.MONGODB_POOL_SIZE || '100', 10),
    REDIS_HOST: process.env.REDIS_HOST || 'localhost',
    REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
    REDIS_PASSWORD: process.env.REDIS_PASSWORD || '',
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'change-me-in-production',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'change-me-in-production',
    JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || '15m',
    JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',
    LOCATION_DISTANCE_THRESHOLD: parseInt(process.env.LOCATION_DISTANCE_THRESHOLD || '10', 10),
    LOCATION_TIME_THRESHOLD: parseInt(process.env.LOCATION_TIME_THRESHOLD || '30', 10),
    AUTO_OFF_TIMEOUT: parseInt(process.env.AUTO_OFF_TIMEOUT || '3600', 10),
    TIMEZONE: process.env.TIMEZONE || 'Asia/Dhaka',
    RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW || '15', 10),
    RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
};

export default env;
