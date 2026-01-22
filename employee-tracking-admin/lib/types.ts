export interface User {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'EMPLOYEE';
    employeeId?: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    user: User;
    tokens: AuthTokens;
}

export interface Employee {
    _id: string;
    name: string;
    email: string;
    employeeId: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Location {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
}

export interface ActivitySession {
    _id: string;
    employee: string | Employee;
    startTime: string;
    endTime?: string;
    status: 'ACTIVE' | 'COMPLETED';
    totalDistance?: number;
    locations?: LocationPoint[];
}

export interface LocationPoint {
    _id: string;
    employee: string | Employee;
    session: string | ActivitySession;
    location: Location;
    accuracy: number;
    speed?: number;
    timestamp: string;
    createdAt: string;
}

export interface DashboardStats {
    totalEmployees: number;
    activeEmployees: number;
    totalSessions: number;
    activeSessions: number;
    totalDistance: number;
    averageDistance: number;
}

export interface SocketEvents {
    'location:update': (data: LocationPoint) => void;
    'session:start': (data: ActivitySession) => void;
    'session:end': (data: ActivitySession) => void;
    'employee:status': (data: { employeeId: string; isActive: boolean }) => void;
}
