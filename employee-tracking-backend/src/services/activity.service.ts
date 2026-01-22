import ActivitySession from '../models/ActivitySession.model';
import { ACTIVITY_STATUS, ERROR_MESSAGES } from '../config/constants';
import { Types } from 'mongoose';
import { getCurrentTime } from '../utils/timezone.util';
import env from '../config/env';

export class ActivityService {
    async startSession(employeeId: Types.ObjectId, latitude: number, longitude: number) {
        // Check for existing active session
        const activeSession = await ActivitySession.findOne({
            employeeId,
            status: ACTIVITY_STATUS.ON,
        });

        // If there's an active session, close it first
        if (activeSession) {
            const endTime = getCurrentTime();
            activeSession.endTime = endTime;
            activeSession.status = ACTIVITY_STATUS.OFF;
            activeSession.endLocation = {
                lat: latitude,
                lng: longitude,
            };
            await activeSession.save();
            console.log(`Auto-closed previous session ${activeSession._id} for employee ${employeeId}`);
        }

        // Create new session
        const session = await ActivitySession.create({
            employeeId,
            startTime: getCurrentTime(),
            status: ACTIVITY_STATUS.ON,
            startLocation: {
                lat: latitude,
                lng: longitude,
            },
        });

        return {
            sessionId: session._id,
            startTime: session.startTime,
            status: session.status,
        };
    }

    async endSession(employeeId: Types.ObjectId, latitude: number, longitude: number) {
        const activeSession = await ActivitySession.findOne({
            employeeId,
            status: ACTIVITY_STATUS.ON,
        });

        if (!activeSession) {
            throw new Error(ERROR_MESSAGES.SESSION_NOT_ACTIVE);
        }

        const endTime = getCurrentTime();
        activeSession.endTime = endTime;
        activeSession.status = ACTIVITY_STATUS.OFF;
        activeSession.endLocation = {
            lat: latitude,
            lng: longitude,
        };

        await activeSession.save();

        return {
            sessionId: activeSession._id,
            startTime: activeSession.startTime,
            endTime: activeSession.endTime,
            duration: activeSession.duration,
            status: activeSession.status,
        };
    }

    async getCurrentSession(employeeId: Types.ObjectId) {
        const session = await ActivitySession.findOne({
            employeeId,
            status: ACTIVITY_STATUS.ON,
        }).select('_id startTime status startLocation');

        return session;
    }

    async getSessionHistory(employeeId: Types.ObjectId, limit: number = 50) {
        const sessions = await ActivitySession.find({ employeeId })
            .sort({ startTime: -1 })
            .limit(limit)
            .select('startTime endTime duration status startLocation endLocation')
            .lean();

        return sessions;
    }

    async autoOffInactiveSessions() {
        const timeout = env.AUTO_OFF_TIMEOUT;
        const cutoffTime = new Date(Date.now() - timeout * 1000);

        const result = await ActivitySession.updateMany(
            {
                status: ACTIVITY_STATUS.ON,
                startTime: { $lt: cutoffTime },
            },
            {
                $set: {
                    status: ACTIVITY_STATUS.AUTO_OFF,
                    endTime: cutoffTime,
                },
            }
        );

        return result.modifiedCount;
    }
}

export default new ActivityService();
