import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import workingHoursService from '../services/workingHours.service';
import { sendSuccess } from '../utils/response.util';
import { HTTP_STATUS } from '../config/constants';
import { Types } from 'mongoose';

export class ReportController {
    async getDailyReport(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { employeeId } = req.params;
            const { date } = req.query;

            const reportDate = date ? new Date(date as string) : new Date();

            const summary = await workingHoursService.getDailySummary(
                new Types.ObjectId(employeeId),
                reportDate
            );

            sendSuccess(res, 'Daily report retrieved successfully', summary, HTTP_STATUS.OK);
        } catch (error) {
            next(error);
        }
    }

    async getDateRangeReport(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { employeeId } = req.params;
            const { startDate, endDate } = req.query;

            if (!startDate || !endDate) {
                res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    message: 'startDate and endDate are required',
                });
                return;
            }

            const summary = await workingHoursService.getDateRangeSummary(
                new Types.ObjectId(employeeId),
                new Date(startDate as string),
                new Date(endDate as string)
            );

            sendSuccess(res, 'Date range report retrieved successfully', summary, HTTP_STATUS.OK);
        } catch (error) {
            next(error);
        }
    }
}

export default new ReportController();
