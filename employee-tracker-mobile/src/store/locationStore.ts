import { create } from 'zustand';
import { LocationData, TrackingSession } from '../types/location';

interface LocationState {
    isTracking: boolean;
    currentLocation: LocationData | null;
    locationQueue: LocationData[];
    lastSyncTime: Date | null;
    lastSync: Date | null;
    session: TrackingSession | null;
    queuedCount: number;
    isLoading: boolean;
    error: string | null;

    setTracking: (isTracking: boolean) => void;
    setCurrentLocation: (location: LocationData) => void;
    addToQueue: (location: LocationData) => void;
    clearQueue: () => void;
    setSession: (session: TrackingSession | null) => void;
    setLastSyncTime: (time: Date) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    reset: () => void;
}

export const useLocationStore = create<LocationState>((set) => ({
    isTracking: false,
    currentLocation: null,
    locationQueue: [],
    lastSyncTime: null,
    lastSync: null,
    session: null,
    queuedCount: 0,
    isLoading: false,
    error: null,

    setTracking: (isTracking) => set({ isTracking }),

    setCurrentLocation: (location) => set({ currentLocation: location }),

    addToQueue: (location) =>
        set((state) => ({
            locationQueue: [...state.locationQueue, location],
            queuedCount: state.queuedCount + 1,
        })),

    clearQueue: () => set({ locationQueue: [], queuedCount: 0 }),

    setSession: (session) => set({ session }),

    setLastSyncTime: (time) => set({ lastSyncTime: time, lastSync: time }),

    setLoading: (isLoading) => set({ isLoading }),

    setError: (error) => set({ error }),

    reset: () =>
        set({
            isTracking: false,
            currentLocation: null,
            locationQueue: [],
            lastSyncTime: null,
            lastSync: null,
            session: null,
            queuedCount: 0,
            isLoading: false,
            error: null,
        }),
}));
