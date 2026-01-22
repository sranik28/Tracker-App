import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { config } from '../../config/env';
import { storage } from '../storage';
import { ApiResponse } from '../../types/api';

class ApiClient {
    private client: AxiosInstance;
    private isRefreshing = false;
    private failedQueue: Array<{
        resolve: (value?: any) => void;
        reject: (reason?: any) => void;
    }> = [];

    constructor() {
        this.client = axios.create({
            baseURL: config.api.baseURL,
            timeout: config.api.timeout,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors() {
        // Request interceptor - Add auth token
        this.client.interceptors.request.use(
            async (config: InternalAxiosRequestConfig) => {
                const token = await storage.getAccessToken();
                if (token && config.headers) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor - Handle token refresh
        this.client.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                const originalRequest = error.config as InternalAxiosRequestConfig & {
                    _retry?: boolean;
                };

                if (error.response?.status === 401 && !originalRequest._retry) {
                    if (this.isRefreshing) {
                        return new Promise((resolve, reject) => {
                            this.failedQueue.push({ resolve, reject });
                        })
                            .then((token) => {
                                if (originalRequest.headers) {
                                    originalRequest.headers.Authorization = `Bearer ${token}`;
                                }
                                return this.client(originalRequest);
                            })
                            .catch((err) => Promise.reject(err));
                    }

                    originalRequest._retry = true;
                    this.isRefreshing = true;

                    try {
                        const refreshToken = await storage.getRefreshToken();
                        if (!refreshToken) {
                            throw new Error('No refresh token');
                        }

                        const { data } = await axios.post<ApiResponse<{ accessToken: string }>>(
                            `${config.api.baseURL}/auth/refresh`,
                            { refreshToken }
                        );

                        if (data.success && data.data) {
                            const tokens = await storage.getTokens();
                            await storage.saveTokens({
                                accessToken: data.data.accessToken,
                                refreshToken: tokens?.refreshToken || refreshToken,
                            });

                            this.processQueue(null, data.data.accessToken);

                            if (originalRequest.headers) {
                                originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
                            }

                            return this.client(originalRequest);
                        }
                    } catch (refreshError) {
                        this.processQueue(refreshError, null);
                        await storage.clearTokens();
                        // Trigger logout/navigation to login
                        return Promise.reject(refreshError);
                    } finally {
                        this.isRefreshing = false;
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    private processQueue(error: any, token: string | null = null) {
        this.failedQueue.forEach((prom) => {
            if (error) {
                prom.reject(error);
            } else {
                prom.resolve(token);
            }
        });

        this.failedQueue = [];
    }

    getInstance(): AxiosInstance {
        return this.client;
    }
}

export const apiClient = new ApiClient().getInstance();
