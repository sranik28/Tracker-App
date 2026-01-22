import { config } from '../config';
import type { LoginRequest, LoginResponse } from '../types';

class ApiClient {
    private baseUrl: string;
    private accessToken: string | null = null;

    constructor() {
        this.baseUrl = config.apiUrl;

        // Load token from localStorage if available
        if (typeof window !== 'undefined') {
            this.accessToken = localStorage.getItem('accessToken');
        }
    }

    setAccessToken(token: string) {
        this.accessToken = token;
        if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', token);
        }
    }

    clearTokens() {
        this.accessToken = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        }
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (this.accessToken) {
            headers['Authorization'] = `Bearer ${this.accessToken}`;
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `HTTP ${response.status}`);
        }

        // Unwrap the 'data' property if it exists, common in this backend structure
        return data.data || data;
    }

    // Auth endpoints
    async login(data: LoginRequest): Promise<LoginResponse> {
        const response = await this.request<any>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(data),
        });

        // Handle flat structure returned by backend { user, accessToken, refreshToken }
        // The request method above now unwraps 'data', so 'response' here is the inner object
        const result: LoginResponse = {
            user: response.user,
            tokens: {
                accessToken: response.accessToken,
                refreshToken: response.refreshToken
            }
        };

        this.setAccessToken(result.tokens.accessToken);
        if (typeof window !== 'undefined') {
            localStorage.setItem('refreshToken', result.tokens.refreshToken);
        }

        return result;
    }

    async logout() {
        try {
            await this.request('/auth/logout', { method: 'POST' });
        } finally {
            this.clearTokens();
        }
    }

    // Employee endpoints
    async getEmployees() {
        return this.request('/employees', { method: 'GET' });
    }

    async getEmployee(id: string) {
        return this.request(`/employees/${id}`, { method: 'GET' });
    }

    // Location endpoints
    async getEmployeeLocations(employeeId: string, sessionId?: string) {
        const params = new URLSearchParams();
        if (sessionId) params.append('session', sessionId);

        const query = params.toString() ? `?${params.toString()}` : '';
        return this.request(`/location/employee/${employeeId}${query}`, {
            method: 'GET',
        });
    }

    async getActiveSessions() {
        return this.request('/location/sessions/active', { method: 'GET' });
    }

    async getActiveLocationSnapshot() {
        return this.request('/location/sessions/snapshot', { method: 'GET' });
    }

    async getEmployeeSessions(employeeId: string) {
        return this.request(`/location/sessions/employee/${employeeId}`, {
            method: 'GET',
        });
    }

    // Dashboard stats
    async getDashboardStats() {
        return this.request('/dashboard/stats', { method: 'GET' });
    }
}

export const apiClient = new ApiClient();
