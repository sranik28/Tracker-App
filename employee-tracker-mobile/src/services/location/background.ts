import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { config } from '../../config/env';
import { LocationData } from '../../types/location';
import { locationApi } from '../api/location';

const BACKGROUND_LOCATION_TASK = 'background-location-task';

// Define the background task
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
    if (error) {
        console.error('Background location error:', error);
        return;
    }

    if (data) {
        const { locations } = data as { locations: Location.LocationObject[] };
        const location = locations[0];

        if (!location) return;

        const { coords } = location;

        // Filter by accuracy
        if (coords.accuracy && coords.accuracy > config.location.accuracyThreshold) {
            return;
        }

        try {
            // Send location to server
            await locationApi.trackLocation({
                latitude: coords.latitude,
                longitude: coords.longitude,
                accuracy: coords.accuracy || 0,
                timestamp: new Date(location.timestamp).toISOString(),
            });
        } catch (error) {
            console.error('Failed to send background location:', error);
            // Location will be queued for retry
        }
    }
});

class BackgroundLocationService {
    async startTracking(): Promise<void> {
        const isTaskDefined = await TaskManager.isTaskDefined(BACKGROUND_LOCATION_TASK);

        if (!isTaskDefined) {
            console.error('Background task not defined');
            return;
        }

        const hasStarted = await Location.hasStartedLocationUpdatesAsync(
            BACKGROUND_LOCATION_TASK
        );

        if (!hasStarted) {
            await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
                accuracy: Location.Accuracy.High,
                timeInterval: config.location.intervals.walking,
                distanceInterval: config.location.distanceFilter,
                foregroundService: {
                    notificationTitle: 'Location Tracking Active',
                    notificationBody: 'Your location is being tracked',
                    notificationColor: '#4CAF50',
                },
                pausesUpdatesAutomatically: false,
                showsBackgroundLocationIndicator: true,
            });
        }
    }

    async stopTracking(): Promise<void> {
        const hasStarted = await Location.hasStartedLocationUpdatesAsync(
            BACKGROUND_LOCATION_TASK
        );

        if (hasStarted) {
            await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
        }
    }

    async isTracking(): Promise<boolean> {
        return await Location.hasStartedLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    }
}

export const backgroundLocationService = new BackgroundLocationService();
