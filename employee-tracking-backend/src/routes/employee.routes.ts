import { Router } from 'express';
import employeeController from '../controllers/employee.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
    createEmployeeSchema,
    updateEmployeeSchema,
    updateEmployeeStatusSchema
} from '../validators/employee.validator';
import { ROLES } from '../config/constants';

const router = Router();

router.post(
    '/',
    authenticate,
    authorize(ROLES.ADMIN),
    validate(createEmployeeSchema),
    employeeController.createEmployee
);

router.get(
    '/',
    authenticate,
    authorize(ROLES.ADMIN),
    employeeController.getEmployees
);

router.get(
    '/:id',
    authenticate,
    employeeController.getEmployeeById
);

router.patch(
    '/:id',
    authenticate,
    authorize(ROLES.ADMIN),
    validate(updateEmployeeSchema),
    employeeController.updateEmployee
);

router.patch(
    '/:id/status',
    authenticate,
    authorize(ROLES.ADMIN),
    validate(updateEmployeeStatusSchema),
    employeeController.updateEmployeeStatus
);

export default router;
