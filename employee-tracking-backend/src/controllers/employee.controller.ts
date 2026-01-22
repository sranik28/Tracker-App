import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import employeeService from '../services/employee.service';
import { sendSuccess, sendError } from '../utils/response.util';
import { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../config/constants';

export class EmployeeController {
    async createEmployee(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const employee = await employeeService.createEmployee(req.body);

            sendSuccess(res, SUCCESS_MESSAGES.EMPLOYEE_CREATED, employee, HTTP_STATUS.CREATED);
        } catch (error: any) {
            if (error.message === ERROR_MESSAGES.DUPLICATE_EMAIL ||
                error.message === ERROR_MESSAGES.DUPLICATE_EMPLOYEE_ID) {
                sendError(res, error.message, HTTP_STATUS.CONFLICT);
            } else {
                next(error);
            }
        }
    }

    async getEmployees(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { isActive } = req.query;

            const filters: any = {};
            if (isActive !== undefined) {
                filters.isActive = isActive === 'true';
            }

            const employees = await employeeService.getEmployees(filters);

            sendSuccess(res, 'Employees retrieved successfully', employees, HTTP_STATUS.OK);
        } catch (error) {
            next(error);
        }
    }

    async getEmployeeById(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const employee = await employeeService.getEmployeeById(req.params.id);

            sendSuccess(res, 'Employee retrieved successfully', employee, HTTP_STATUS.OK);
        } catch (error: any) {
            if (error.message === ERROR_MESSAGES.EMPLOYEE_NOT_FOUND) {
                sendError(res, error.message, HTTP_STATUS.NOT_FOUND);
            } else {
                next(error);
            }
        }
    }

    async updateEmployee(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const employee = await employeeService.updateEmployee(req.params.id, req.body);

            sendSuccess(res, SUCCESS_MESSAGES.EMPLOYEE_UPDATED, employee, HTTP_STATUS.OK);
        } catch (error: any) {
            if (error.message === ERROR_MESSAGES.EMPLOYEE_NOT_FOUND) {
                sendError(res, error.message, HTTP_STATUS.NOT_FOUND);
            } else {
                next(error);
            }
        }
    }

    async updateEmployeeStatus(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { isActive } = req.body;
            const employee = await employeeService.updateEmployeeStatus(req.params.id, isActive);

            sendSuccess(res, 'Employee status updated successfully', employee, HTTP_STATUS.OK);
        } catch (error: any) {
            if (error.message === ERROR_MESSAGES.EMPLOYEE_NOT_FOUND) {
                sendError(res, error.message, HTTP_STATUS.NOT_FOUND);
            } else {
                next(error);
            }
        }
    }
}

export default new EmployeeController();
