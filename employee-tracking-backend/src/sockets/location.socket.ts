import { getIO } from './index';

interface LocationUpdate {
    employeeId: string;
    employeeName: string;
    latitude: number;
    longitude: number;
    accuracy: number;
    batteryLevel?: number;
    timestamp: Date;
}

const lastEmitTime = new Map<string, number>();
const THROTTLE_INTERVAL = 1000; // 1 second

export const broadcastLocationUpdate = (locationData: LocationUpdate): void => {
    try {
        const io = getIO();
        const now = Date.now();
        const lastEmit = lastEmitTime.get(locationData.employeeId) || 0;

        if (now - lastEmit < THROTTLE_INTERVAL) {
            return;
        }

        io.of('/admin').emit('location:update', locationData);

        lastEmitTime.set(locationData.employeeId, now);
    } catch (error) {
        console.error('Error broadcasting location update:', error);
    }
};

export const broadcastSessionUpdate = (sessionData: {
    employeeId: string;
    employeeName: string;
    status: string;
    timestamp: Date;
}): void => {
    try {
        const io = getIO();
        io.of('/admin').emit('session:update', sessionData);
    } catch (error) {
        console.error('Error broadcasting session update:', error);
    }
};
