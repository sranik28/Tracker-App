import * as Location from 'expo-location';
import * as Battery from 'expo-battery';
import { config } from '../../config/env';
import { LocationData } from '../../types/location';
import { calculateDistance } from '../../utils/helpers';

class ForegroundLocationService {
    private watchId: Location.LocationSubscription | null = null;
    private lastLocation: LocationData | null = null;
    private onLocationUpdate: ((location: LocationData) => void) | null = null;

    async requestPermissions(): Promise<boolean> {
        const { status: foregroundStatus } =
            await Location.requestForegroundPermissionsAsync();

        if (foregroundStatus !== 'granted') {
            return false;
        }

        const { status: backgroundStatus } =
            await Location.requestBackgroundPermissionsAsync();

        return backgroundStatus === 'granted';
    }

    async checkPermissions(): Promise<{
        foreground: boolean;
        background: boolean;
    }> {
        const foreground = await Location.getForegroundPermissionsAsync();
        const background = await Location.getBackgroundPermissionsAsync();

        return {
            foreground: foreground.status === 'granted',
            background: background.status === 'granted',
        };
    }

    async startTracking(callback: (location: LocationData) => void): Promise<void> {
        this.onLocationUpdate = callback;

        const batteryLevel = await Battery.getBatteryLevelAsync();
        const interval = this.getInterval(0, batteryLevel);

        this.watchId = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.High,
                timeInterval: interval,
                distanceInterval: config.location.distanceFilter,
            },
            (location) => {
                this.handleLocationUpdate(location);
            }
        );
    }

    stopTracking(): void {
        if (this.watchId) {
            this.watchId.remove();
            this.watchId = null;
        }
        this.lastLocation = null;
        this.onLocationUpdate = null;
    }

    private async handleLocationUpdate(location: Location.LocationObject): Promise<void> {
        const { coords } = location;

        // Filter by accuracy
        if (coords.accuracy && coords.accuracy > config.location.accuracyThreshold) {
            return;
        }

        const locationData: LocationData = {
            latitude: coords.latitude,
            longitude: coords.longitude,
            accuracy: coords.accuracy || 0,
            batteryLevel: await Battery.getBatteryLevelAsync(),
            timestamp: new Date(location.timestamp),
        };

        // Check if location should be saved
        if (this.shouldSaveLocation(locationData)) {
            this.lastLocation = locationData;
            this.onLocationUpdate?.(locationData);
        }
    }

    private shouldSaveLocation(location: LocationData): boolean {
        if (!this.lastLocation) return true;

        const distance = calculateDistance(
            this.lastLocation.latitude,
            this.lastLocation.longitude,
            location.latitude,
            location.longitude
        );

        const timeDiff =
            (location.timestamp.getTime() - this.lastLocation.timestamp.getTime()) / 1000;

        return (
            distance >= config.location.distanceFilter ||
            timeDiff >= config.location.intervals.stationary / 1000
        );
    }

    private getInterval(speed: number, batteryLevel: number): number {
        if (batteryLevel < config.location.lowBatteryThreshold) {
            return config.location.intervals.lowBattery;
        }

        if (speed < 1) return config.location.intervals.stationary;
        if (speed < 5) return config.location.intervals.walking;
        return config.location.intervals.moving;
    }
}

export const foregroundLocationService = new ForegroundLocationService();
