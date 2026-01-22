import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import locationService from '../services/location.service';
import { sendSuccess, sendError } from '../utils/response.util';
import { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../config/constants';
import { Types } from 'mongoose';

export class LocationController {
    async trackLocation(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                sendError(res, ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
                return;
            }

            const result = await locationService.trackLocation(req.user.id, req.body);

            sendSuccess(res, SUCCESS_MESSAGES.LOCATION_SAVED, result, HTTP_STATUS.CREATED);
        } catch (error: any) {
            if (error.message === ERROR_MESSAGES.SESSION_NOT_ACTIVE) {
                sendError(res, error.message, HTTP_STATUS.BAD_REQUEST);
            } else {
                next(error);
            }
        }
    }

    async trackBatchLocations(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                sendError(res, ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
                return;
            }

            const { locations } = req.body;
            const result = await locationService.trackBatchLocations(req.user.id, locations);

            sendSuccess(res, `Saved ${result.saved} of ${result.total} locations`, result, HTTP_STATUS.CREATED);
        } catch (error: any) {
            if (error.message === ERROR_MESSAGES.SESSION_NOT_ACTIVE) {
                sendError(res, error.message, HTTP_STATUS.BAD_REQUEST);
            } else {
                next(error);
            }
        }
    }

    async getLocationHistory(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { employeeId } = req.params;
            const { startDate, endDate, limit } = req.query;

            const locations = await locationService.getLocationHistory(
                new Types.ObjectId(employeeId),
                startDate ? new Date(startDate as string) : undefined,
                endDate ? new Date(endDate as string) : undefined,
                limit ? parseInt(limit as string, 10) : undefined
            );

            sendSuccess(res, 'Location history retrieved successfully', locations, HTTP_STATUS.OK);
        } catch (error) {
            next(error);
        }
    }

    async getLocationSnapshot(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const snapshot = await locationService.getActiveLocationsSnapshot();
            sendSuccess(res, 'Active locations snapshot retrieved', snapshot, HTTP_STATUS.OK);
        } catch (error) {
            next(error);
        }
    }
}

export default new LocationController();
