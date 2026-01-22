import { Request, Response } from 'express';
import User from '../models/User.model';
import ActivitySession from '../models/ActivitySession.model';
import { ACTIVITY_STATUS } from '../config/constants';

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const [
            totalEmployees,
            activeEmployees, // This is essentially active sessions
            totalSessions,
            activeSessionsCount
        ] = await Promise.all([
            User.countDocuments({ role: 'EMPLOYEE' }),
            ActivitySession.countDocuments({ status: ACTIVITY_STATUS.ON }),
            ActivitySession.countDocuments(),
            ActivitySession.countDocuments({ status: ACTIVITY_STATUS.ON })
        ]);

        res.status(200).json({
            totalEmployees,
            activeEmployees: activeSessionsCount, // Assuming 1 active session per employee
            totalSessions,
            activeSessions: activeSessionsCount,
            totalDistance: 0, // Placeholder for now, requires complex aggregation
            averageDistance: 0 // Placeholder
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
};
