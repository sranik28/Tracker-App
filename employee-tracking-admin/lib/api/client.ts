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
            localStorage.removeItem('user');
        }
    }

    // Sync token from localStorage (useful after page reload)
    syncToken() {
        if (typeof window !== 'undefined') {
            this.accessToken = localStorage.getItem('accessToken');
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

        // Always get the latest token from localStorage
        const token = typeof window !== 'undefined' 
            ? localStorage.getItem('accessToken') 
            : this.accessToken;

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            // If unauthorized, clear tokens
            if (response.status === 401) {
                this.clearTokens();
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('user');
                }
            }
            throw new Error(data.message || `HTTP ${response.status}`);
        }

        // Unwrap the 'data' property if it exists, common in this backend structure
        return data.data || data;
    }

    // Auth endpoints
    async login(data: LoginRequest): Promise<LoginResponse> {
        // Don't send token for login request
        const tempToken = this.accessToken;
        this.accessToken = null;

        try {
            const response = await this.request<any>('/auth/login', {
                method: 'POST',
                body: JSON.stringify(data),
            });

            // Handle response structure: backend returns { success, message, data: { user, accessToken, refreshToken } }
            const loginData = response;
            
            const result: LoginResponse = {
                user: loginData.user,
                tokens: {
                    accessToken: loginData.accessToken,
                    refreshToken: loginData.refreshToken
                }
            };

            // Save tokens
            this.setAccessToken(result.tokens.accessToken);
            if (typeof window !== 'undefined') {
                localStorage.setItem('refreshToken', result.tokens.refreshToken);
            }

            return result;
        } finally {
            // Restore token if login fails
            this.accessToken = tempToken;
        }
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
