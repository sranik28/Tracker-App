import { Router } from 'express';
import reportController from '../controllers/report.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { ROLES } from '../config/constants';

const router = Router();

router.get(
    '/daily/:employeeId',
    authenticate,
    authorize(ROLES.ADMIN),
    reportController.getDailyReport
);

router.get(
    '/range/:employeeId',
    authenticate,
    authorize(ROLES.ADMIN),
    reportController.getDateRangeReport
);

export default router;
