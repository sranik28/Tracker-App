import { apiClient } from './client';
import { storage } from '../storage';
import {
    LoginRequest,
    LoginResponse,
    RefreshTokenResponse,
    ApiResponse,
} from '../../types/api';

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    employeeId?: string;
}

export const authApi = {
    async register(data: RegisterRequest): Promise<LoginResponse> {
        const { data: response } = await apiClient.post<ApiResponse<LoginResponse>>(
            '/auth/register',
            data
        );

        if (!response.success || !response.data) {
            throw new Error(response.message || 'Registration failed');
        }

        // Save tokens
        await storage.saveTokens({
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
        });

        return response.data;
    },

    async login(credentials: LoginRequest): Promise<LoginResponse> {
        const { data } = await apiClient.post<ApiResponse<LoginResponse>>(
            '/auth/login',
            credentials
        );

        if (!data.success || !data.data) {
            throw new Error(data.message || 'Login failed');
        }

        // Save tokens
        await storage.saveTokens({
            accessToken: data.data.accessToken,
            refreshToken: data.data.refreshToken,
        });

        return data.data;
    },

    async logout(): Promise<void> {
        try {
            await apiClient.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            await storage.clearTokens();
        }
    },

    async refreshToken(refreshToken: string): Promise<string> {
        const { data } = await apiClient.post<ApiResponse<RefreshTokenResponse>>(
            '/auth/refresh',
            { refreshToken }
        );

        if (!data.success || !data.data) {
            throw new Error('Token refresh failed');
        }

        return data.data.accessToken;
    },
};


