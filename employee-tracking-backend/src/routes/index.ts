import { Router } from 'express';
import authRoutes from './auth.routes';
import employeeRoutes from './employee.routes';
import locationRoutes from './location.routes';
import reportRoutes from './report.routes';
import dashboardRoutes from './dashboard.routes';
import env from '../config/env';

const router = Router();

const apiVersion = env.API_VERSION;

router.use(`/api/${apiVersion}/auth`, authRoutes);
router.use(`/api/${apiVersion}/employees`, employeeRoutes);
router.use(`/api/${apiVersion}/location`, locationRoutes);
router.use(`/api/${apiVersion}/reports`, reportRoutes);
router.use(`/api/${apiVersion}/dashboard`, dashboardRoutes);

router.get('/health', (_req, res) => {
    res.json({
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
    });
});

export default router;
