import { Request } from 'express';
import { Types } from 'mongoose';

export interface AuthRequest extends Request {
    user?: {
        id: Types.ObjectId;
        email: string;
        role: string;
        employeeId?: string;
    };
}

export interface LocationPayload {
    latitude: number;
    longitude: number;
    accuracy: number;
    batteryLevel?: number;
    timestamp: Date;
}

export interface BatchLocationPayload {
    locations: LocationPayload[];
}

export interface TokenPayload {
    id: string;
    email: string;
    role: string;
    employeeId?: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}
