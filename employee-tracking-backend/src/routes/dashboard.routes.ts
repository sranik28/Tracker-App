import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All dashboard routes require admin access
router.use(authenticate, authorize(['ADMIN']));

router.get('/stats', getDashboardStats);

export default router;
