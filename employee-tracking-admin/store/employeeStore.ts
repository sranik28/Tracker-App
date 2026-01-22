import { create } from 'zustand';
import type { Employee, LocationPoint, ActivitySession } from '../lib/types';

interface EmployeeState {
    employees: Employee[];
    activeEmployees: Map<string, LocationPoint>;
    activeSessions: ActivitySession[];
    setEmployees: (employees: Employee[]) => void;
    updateEmployeeLocation: (location: LocationPoint) => void;
    setActiveSessions: (sessions: ActivitySession[]) => void;
    updateSession: (session: ActivitySession) => void;
}

export const useEmployeeStore = create<EmployeeState>((set) => ({
    employees: [],
    activeEmployees: new Map(),
    activeSessions: [],

    setEmployees: (employees) => set({ employees }),

    updateEmployeeLocation: (location) =>
        set((state) => {
            const newActiveEmployees = new Map(state.activeEmployees);
            const employeeId = typeof location.employee === 'string'
                ? location.employee
                : location.employee._id;
            newActiveEmployees.set(employeeId, location);
            return { activeEmployees: newActiveEmployees };
        }),

    setActiveSessions: (sessions) => set({ activeSessions: sessions }),

    updateSession: (session) =>
        set((state) => {
            const index = state.activeSessions.findIndex((s) => s._id === session._id);
            if (index !== -1) {
                const newSessions = [...state.activeSessions];
                newSessions[index] = session;
                return { activeSessions: newSessions };
            } else if (session.status === 'ACTIVE') {
                return { activeSessions: [...state.activeSessions, session] };
            }
            return state;
        }),
}));
