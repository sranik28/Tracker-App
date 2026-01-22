import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.util';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants';

export const errorHandler = (
    error: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    console.error('Error:', error);

    if (error.name === 'ValidationError') {
        sendError(res, ERROR_MESSAGES.VALIDATION_ERROR, HTTP_STATUS.BAD_REQUEST, error.message);
        return;
    }

    if (error.name === 'CastError') {
        sendError(res, 'Invalid ID format', HTTP_STATUS.BAD_REQUEST);
        return;
    }

    if (error.name === 'MongoServerError' && (error as any).code === 11000) {
        const field = Object.keys((error as any).keyPattern)[0];
        sendError(
            res,
            `${field} already exists`,
            HTTP_STATUS.CONFLICT,
            error.message
        );
        return;
    }

    sendError(
        res,
        ERROR_MESSAGES.INTERNAL_ERROR,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        error.message
    );
};
