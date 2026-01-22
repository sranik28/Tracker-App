import { apiClient } from './client';
import { LocationUpdate, BatchLocationRequest, ApiResponse } from '../../types/api';

export const locationApi = {
    async startTracking(latitude: number, longitude: number): Promise<{ sessionId: string }> {
        const { data } = await apiClient.post<ApiResponse<{ sessionId: string }>>(
            '/location/on',
            { latitude, longitude }
        );

        if (!data.success || !data.data) {
            throw new Error(data.message || 'Failed to start tracking');
        }

        return data.data;
    },

    async stopTracking(latitude: number, longitude: number): Promise<void> {
        const { data } = await apiClient.post<ApiResponse>('/location/off', {
            latitude,
            longitude,
        });

        if (!data.success) {
            throw new Error(data.message || 'Failed to stop tracking');
        }
    },

    async trackLocation(location: LocationUpdate): Promise<void> {
        const { data } = await apiClient.post<ApiResponse>('/location/track', location);

        if (!data.success) {
            throw new Error(data.message || 'Failed to track location');
        }
    },

    async trackBatchLocations(locations: LocationUpdate[]): Promise<{ saved: number; total: number }> {
        const { data } = await apiClient.post<ApiResponse<{ saved: number; total: number }>>(
            '/location/batch',
            { locations }
        );

        if (!data.success || !data.data) {
            throw new Error(data.message || 'Failed to upload batch locations');
        }

        return data.data;
    },

    async getCurrentSession(): Promise<any> {
        const { data } = await apiClient.get<ApiResponse>('/location/status');

        if (!data.success) {
            throw new Error(data.message || 'Failed to get session status');
        }

        return data.data;
    },
};
