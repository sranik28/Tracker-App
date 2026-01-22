import { Response } from 'express';
import { HTTP_STATUS } from '../config/constants';
import { ApiResponse } from '../types';

export const sendSuccess = <T>(
    res: Response,
    message: string,
    data?: T,
    statusCode: number = HTTP_STATUS.OK
): Response => {
    const response: ApiResponse<T> = {
        success: true,
        message,
        data,
    };
    return res.status(statusCode).json(response);
};

export const sendError = (
    res: Response,
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    error?: string
): Response => {
    const response: ApiResponse = {
        success: false,
        message,
        error,
    };
    return res.status(statusCode).json(response);
};
