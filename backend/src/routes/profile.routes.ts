import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/profile.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Profile routes - all require authentication
router.use(authenticateToken);

router.get('/', asyncHandler(getProfile));
router.put('/', asyncHandler(updateProfile));

export default router;