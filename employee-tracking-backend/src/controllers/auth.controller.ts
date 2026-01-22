import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import authService from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response.util';
import { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../config/constants';

export class AuthController {
    async register(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { name, email, password, employeeId } = req.body;

            const result = await authService.register(name, email, password, employeeId);

            sendSuccess(res, 'Registration successful', result, HTTP_STATUS.CREATED);
        } catch (error: any) {
            if (error.message.includes('already exists')) {
                sendError(res, error.message, HTTP_STATUS.CONFLICT);
            } else {
                next(error);
            }
        }
    }

    async login(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;

            const result = await authService.login(email, password);

            sendSuccess(res, SUCCESS_MESSAGES.LOGIN_SUCCESS, result, HTTP_STATUS.OK);
        } catch (error: any) {
            if (error.message === ERROR_MESSAGES.INVALID_CREDENTIALS ||
                error.message === ERROR_MESSAGES.USER_INACTIVE) {
                sendError(res, error.message, HTTP_STATUS.UNAUTHORIZED);
            } else {
                next(error);
            }
        }
    }

    async refreshToken(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { refreshToken } = req.body;

            const result = await authService.refreshToken(refreshToken);

            sendSuccess(res, SUCCESS_MESSAGES.TOKEN_REFRESHED, result, HTTP_STATUS.OK);
        } catch (error: any) {
            if (error.message === ERROR_MESSAGES.TOKEN_INVALID) {
                sendError(res, error.message, HTTP_STATUS.UNAUTHORIZED);
            } else {
                next(error);
            }
        }
    }

    async logout(_req: AuthRequest, res: Response, next: NextFunction) {
        try {
            sendSuccess(res, SUCCESS_MESSAGES.LOGOUT_SUCCESS, null, HTTP_STATUS.OK);
        } catch (error) {
            next(error);
        }
    }
}

export default new AuthController();
