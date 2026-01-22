import { Router } from 'express';
import locationController from '../controllers/location.controller';
import activityController from '../controllers/activity.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { trackLocationSchema, batchLocationSchema, locationHistorySchema } from '../validators/location.validator';
import { ROLES } from '../config/constants';
import { z } from 'zod';

const router = Router();

// Activity endpoints
const startSessionSchema = z.object({
    body: z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
    }),
});

router.post(
    '/on',
    authenticate,
    authorize(ROLES.EMPLOYEE),
    validate(startSessionSchema),
    activityController.startSession
);

router.post(
    '/off',
    authenticate,
    authorize(ROLES.EMPLOYEE),
    validate(startSessionSchema),
    activityController.endSession
);

router.get(
    '/status',
    authenticate,
    authorize(ROLES.EMPLOYEE),
    activityController.getCurrentSession
);

// Location tracking endpoints
router.post(
    '/track',
    authenticate,
    authorize(ROLES.EMPLOYEE),
    validate(trackLocationSchema),
    locationController.trackLocation
);

router.post(
    '/batch',
    authenticate,
    authorize(ROLES.EMPLOYEE),
    validate(batchLocationSchema),
    locationController.trackBatchLocations
);

// Admin endpoints
router.get(
    '/history/:employeeId',
    authenticate,
    authorize(ROLES.ADMIN),
    validate(locationHistorySchema),
    locationController.getLocationHistory
);

// Get active locations snapshot (for admin map initialization)
router.get(
    '/sessions/snapshot',
    authenticate,
    authorize(ROLES.ADMIN),
    locationController.getLocationSnapshot
);

router.get(
    '/sessions/:employeeId',
    authenticate,
    authorize(ROLES.ADMIN),
    activityController.getSessionHistory
);

export default router;
