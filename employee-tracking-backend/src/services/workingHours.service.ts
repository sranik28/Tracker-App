import DailyWorkSummary from '../models/DailyWorkSummary.model';
import ActivitySession from '../models/ActivitySession.model';
import { Types } from 'mongoose';
import { getDayBoundaries } from '../utils/timezone.util';
import { ACTIVITY_STATUS } from '../config/constants';

export class WorkingHoursService {
    async calculateDailyHours(employeeId: Types.ObjectId, date: Date) {
        const { start, end } = getDayBoundaries(date);

        const sessions = await ActivitySession.find({
            employeeId,
            startTime: { $gte: start, $lte: end },
            status: { $in: [ACTIVITY_STATUS.OFF, ACTIVITY_STATUS.AUTO_OFF] },
        })
            .select('_id startTime endTime duration')
            .lean();

        const totalMinutes = sessions.reduce((sum, session) => sum + session.duration, 0);

        const sessionSummaries = sessions.map((session) => ({
            sessionId: session._id,
            startTime: session.startTime,
            endTime: session.endTime!,
            duration: session.duration,
        }));

        const summary = await DailyWorkSummary.findOneAndUpdate(
            { employeeId, date: start },
            {
                $set: {
                    totalMinutes,
                    sessions: sessionSummaries,
                },
            },
            { upsert: true, new: true }
        );

        return {
            date: summary.date,
            totalMinutes: summary.totalMinutes,
            totalHours: (summary.totalMinutes / 60).toFixed(2),
            sessions: summary.sessions,
        };
    }

    async getDailySummary(employeeId: Types.ObjectId, date: Date) {
        const { start } = getDayBoundaries(date);

        const summary = await DailyWorkSummary.findOne({
            employeeId,
            date: start,
        }).lean();

        if (!summary) {
            return this.calculateDailyHours(employeeId, date);
        }

        return {
            date: summary.date,
            totalMinutes: summary.totalMinutes,
            totalHours: (summary.totalMinutes / 60).toFixed(2),
            sessions: summary.sessions,
        };
    }

    async getDateRangeSummary(employeeId: Types.ObjectId, startDate: Date, endDate: Date) {
        const { start } = getDayBoundaries(startDate);
        const { end } = getDayBoundaries(endDate);

        const summaries = await DailyWorkSummary.find({
            employeeId,
            date: { $gte: start, $lte: end },
        })
            .sort({ date: -1 })
            .lean();

        const totalMinutes = summaries.reduce((sum, summary) => sum + summary.totalMinutes, 0);

        return {
            startDate: start,
            endDate: end,
            totalMinutes,
            totalHours: (totalMinutes / 60).toFixed(2),
            dailySummaries: summaries.map((s) => ({
                date: s.date,
                totalMinutes: s.totalMinutes,
                totalHours: (s.totalMinutes / 60).toFixed(2),
                sessionCount: s.sessions.length,
            })),
        };
    }
}

export default new WorkingHoursService();
