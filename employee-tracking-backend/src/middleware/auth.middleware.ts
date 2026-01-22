import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { verifyAccessToken } from '../utils/jwt.util';
import { sendError } from '../utils/response.util';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants';
import User from '../models/User.model';
import { Types } from 'mongoose';

export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            sendError(res, ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
            return;
        }

        const token = authHeader.substring(7);

        try {
            const decoded = verifyAccessToken(token);

            const user = await User.findById(decoded.id).select('_id email role employeeId isActive');

            if (!user) {
                sendError(res, ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
                return;
            }

            if (!user.isActive) {
                sendError(res, ERROR_MESSAGES.USER_INACTIVE, HTTP_STATUS.FORBIDDEN);
                return;
            }

            req.user = {
                id: user._id as Types.ObjectId,
                email: user.email,
                role: user.role,
                employeeId: user.employeeId,
            };

            next();
        } catch (error) {
            sendError(res, ERROR_MESSAGES.TOKEN_INVALID, HTTP_STATUS.UNAUTHORIZED);
        }
    } catch (error) {
        sendError(res, ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
};

export const authorize = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            sendError(res, ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
            return;
        }

        if (!roles.includes(req.user.role)) {
            sendError(res, ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
            return;
        }

        next();
    };
};
