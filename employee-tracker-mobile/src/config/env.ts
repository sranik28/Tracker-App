export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
export const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:5000';

export const config = {
    api: {
        baseURL: `${API_URL}/api/v1`,
        timeout: 10000,
    },
    location: {
        // Distance threshold in meters
        distanceFilter: 10,
        // Accuracy threshold in meters
        accuracyThreshold: 50,
        // Batch size for location uploads
        batchSize: 10,
        // Flush interval in milliseconds (5 minutes)
        flushInterval: 5 * 60 * 1000,
        // Tracking intervals based on state (in milliseconds)
        intervals: {
            stationary: 5 * 60 * 1000, // 5 minutes
            walking: 60 * 1000, // 1 minute
            moving: 30 * 1000, // 30 seconds
            lowBattery: 10 * 60 * 1000, // 10 minutes
        },
        // Battery level threshold for low battery mode
        lowBatteryThreshold: 0.2, // 20%
    },
} as const;
