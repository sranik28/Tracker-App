import * as Location from 'expo-location';
import { useLocationStore } from '../../store/locationStore';
import { locationApi } from '../api/location';
import { foregroundLocationService } from './foreground';
import { Alert } from 'react-native';

class LocationService {
    private isInitialized = false;

    async initialize() {
        if (this.isInitialized) return;

        try {
            // Request location permissions
            const { status: foregroundStatus } =
                await Location.requestForegroundPermissionsAsync();

            if (foregroundStatus !== 'granted') {
                throw new Error('Location permission not granted');
            }

            // Request background permissions
            const { status: backgroundStatus } =
                await Location.requestBackgroundPermissionsAsync();

            if (backgroundStatus !== 'granted') {
                console.warn('Background location permission not granted');
            }

            this.isInitialized = true;
        } catch (error) {
            console.error('Location service initialization error:', error);
            throw error;
        }
    }

    async startTracking() {
        try {
            // Ensure initialized
            await this.initialize();

            // Get current location
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            // Call API to start session (using startTracking method)
            await locationApi.startTracking(
                location.coords.latitude,
                location.coords.longitude
            );

            // Start foreground tracking with callback
            await foregroundLocationService.startTracking(async (locationData) => {
                // Handle location updates
                console.log('Location update:', locationData);
                useLocationStore.getState().setCurrentLocation(locationData);
                useLocationStore.getState().setLastSyncTime(new Date());

                // Send to backend
                try {
                    await locationApi.trackLocation({
                        latitude: locationData.latitude,
                        longitude: locationData.longitude,
                        accuracy: locationData.accuracy || 0,
                        timestamp: locationData.timestamp || Date.now(),
                    });
                } catch (error) {
                    console.error('Failed to send location update:', error);
                }
            });

            // Update store
            useLocationStore.getState().setTracking(true);

            console.log('Tracking started successfully');
        } catch (error: any) {
            console.error('Start tracking error:', error);
            throw new Error(error.message || 'Failed to start tracking');
        }
    }

    async stopTracking() {
        try {
            // Get current location
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            // Stop foreground tracking
            foregroundLocationService.stopTracking();

            // Call API to stop session (using stopTracking method)
            await locationApi.stopTracking(
                location.coords.latitude,
                location.coords.longitude
            );

            // Update store
            useLocationStore.getState().setTracking(false);

            console.log('Tracking stopped successfully');
        } catch (error: any) {
            console.error('Stop tracking error:', error);
            throw new Error(error.message || 'Failed to stop tracking');
        }
    }

    async checkPermissions(): Promise<boolean> {
        const { status } = await Location.getForegroundPermissionsAsync();
        return status === 'granted';
    }
}

export const locationService = new LocationService();
