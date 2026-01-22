import { config } from '../../config/env';
import { LocationData, LocationUpdate } from '../../types/location';
import { locationApi } from '../api/location';

class LocationBatcher {
    private queue: LocationData[] = [];
    private flushTimer: NodeJS.Timeout | null = null;

    constructor() {
        this.startFlushTimer();
    }

    add(location: LocationData): void {
        this.queue.push(location);

        // Auto-flush if queue is full
        if (this.queue.length >= config.location.batchSize) {
            this.flush();
        }
    }

    async flush(): Promise<{ saved: number; total: number } | null> {
        if (this.queue.length === 0) return null;

        const locationsToSend = [...this.queue];
        this.queue = [];

        try {
            const locations: LocationUpdate[] = locationsToSend.map((loc) => ({
                latitude: loc.latitude,
                longitude: loc.longitude,
                accuracy: loc.accuracy,
                batteryLevel: loc.batteryLevel,
                timestamp: loc.timestamp.toISOString(),
            }));

            const result = await locationApi.trackBatchLocations(locations);
            return result;
        } catch (error) {
            console.error('Failed to flush locations:', error);
            // Re-add to queue for retry
            this.queue = [...locationsToSend, ...this.queue];
            return null;
        }
    }

    getQueueSize(): number {
        return this.queue.length;
    }

    clearQueue(): void {
        this.queue = [];
    }

    private startFlushTimer(): void {
        this.flushTimer = setInterval(() => {
            this.flush();
        }, config.location.flushInterval);
    }

    stopFlushTimer(): void {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
            this.flushTimer = null;
        }
    }
}

export const locationBatcher = new LocationBatcher();
