import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { config } from '../lib/config';
import { useEmployeeStore } from '../store/employeeStore';
import type { LocationPoint, ActivitySession } from '../lib/types';
import { apiClient } from '@/lib/api/client';

export function useSocket() {
    const socketRef = useRef<Socket | null>(null);
    const { updateEmployeeLocation, updateSession } = useEmployeeStore();

    useEffect(() => {
        // Only connect if we have an access token
        const token = typeof window !== 'undefined'
            ? localStorage.getItem('accessToken')
            : null;

        if (!token) return;

        // Create socket connection
        socketRef.current = io(`${config.socketUrl}/admin`, {
            auth: { token },
            transports: ['websocket', 'polling'],
        });

        const socket = socketRef.current;

        // Connection events
        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        // Real-time location updates
        socket.on('location:update', (data: LocationPoint) => {
            console.log('Location update received:', data);
            updateEmployeeLocation(data);
        });

        // Session events
        socket.on('session:start', (data: ActivitySession) => {
            console.log('Session started:', data);
            updateSession(data);
        });

        socket.on('session:end', (data: ActivitySession) => {
            console.log('Session ended:', data);
            updateSession(data);
        });

        // Fetch initial state
        const fetchInitialState = async () => {
            try {
                const snapshot = await apiClient.getActiveLocationSnapshot();
                if (Array.isArray(snapshot)) {
                    console.log('Fetched initial active locations:', snapshot);
                    snapshot.forEach((point: LocationPoint) => {
                        updateEmployeeLocation(point);
                    });
                }
            } catch (error) {
                console.error('Failed to fetch initial state:', error);
            }
        };

        fetchInitialState();

        // Cleanup on unmount
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [updateEmployeeLocation, updateSession]);

    return socketRef.current;
}
