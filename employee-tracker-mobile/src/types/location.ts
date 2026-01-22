export interface LocationData {
    latitude: number;
    longitude: number;
    accuracy: number;
    batteryLevel?: number;
    timestamp: Date;
}

export interface LocationUpdate {
    latitude: number;
    longitude: number;
    accuracy: number;
    batteryLevel?: number;
    timestamp: string;
}

export interface BatchLocationRequest {
    locations: LocationUpdate[];
}

export interface TrackingSession {
    sessionId: string;
    startTime: Date;
    status: 'ON' | 'OFF';
}

export interface LocationState {
    isTracking: boolean;
    currentLocation: LocationData | null;
    locationQueue: LocationData[];
    lastSyncTime: Date | null;
    session: TrackingSession | null;
}
