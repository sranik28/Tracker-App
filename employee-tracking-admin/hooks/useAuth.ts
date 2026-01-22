'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export function useAuth(requireAuth = true) {
    const router = useRouter();
    const { user, isAuthenticated, setUser } = useAuthStore();

    useEffect(() => {
        // Check if user is authenticated
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('accessToken');
            const userStr = localStorage.getItem('user');

            if (token && userStr) {
                try {
                    const userData = JSON.parse(userStr);
                    setUser(userData);
                } catch (error) {
                    console.error('Failed to parse user data:', error);
                    localStorage.removeItem('user');
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                }
            }

            // Redirect if auth is required but user is not authenticated
            if (requireAuth && !token) {
                router.push('/login');
            } else if (!requireAuth && token) {
                router.push('/dashboard');
            }
        }
    }, [requireAuth, router, setUser]);

    return { user, isAuthenticated };
}
