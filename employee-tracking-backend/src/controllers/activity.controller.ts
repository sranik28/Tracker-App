import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import activityService from '../services/activity.service';
import { sendSuccess, sendError } from '../utils/response.util';
import { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../config/constants';
import { Types } from 'mongoose';

export class ActivityController {
    async startSession(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                sendError(res, ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
                return;
            }

            const { latitude, longitude } = req.body;
            const result = await activityService.startSession(req.user.id, latitude, longitude);

            sendSuccess(res, SUCCESS_MESSAGES.SESSION_STARTED, result, HTTP_STATUS.CREATED);
        } catch (error: any) {
            if (error.message === ERROR_MESSAGES.SESSION_ALREADY_ACTIVE) {
                sendError(res, error.message, HTTP_STATUS.CONFLICT);
            } else {
                next(error);
            }
        }
    }

    async endSession(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                sendError(res, ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
                return;
            }

            const { latitude, longitude } = req.body;
            const result = await activityService.endSession(req.user.id, latitude, longitude);

            sendSuccess(res, SUCCESS_MESSAGES.SESSION_ENDED, result, HTTP_STATUS.OK);
        } catch (error: any) {
            if (error.message === ERROR_MESSAGES.SESSION_NOT_ACTIVE) {
                sendError(res, error.message, HTTP_STATUS.BAD_REQUEST);
            } else {
                next(error);
            }
        }
    }

    async getCurrentSession(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                sendError(res, ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
                return;
            }

            const session = await activityService.getCurrentSession(req.user.id);

            sendSuccess(res, 'Current session retrieved successfully', session, HTTP_STATUS.OK);
        } catch (error) {
            next(error);
        }
    }

    async getSessionHistory(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { employeeId } = req.params;
            const { limit } = req.query;

            const sessions = await activityService.getSessionHistory(
                new Types.ObjectId(employeeId),
                limit ? parseInt(limit as string, 10) : undefined
            );

            sendSuccess(res, 'Session history retrieved successfully', sessions, HTTP_STATUS.OK);
        } catch (error) {
            next(error);
        }
    }
}

export default new ActivityController();
