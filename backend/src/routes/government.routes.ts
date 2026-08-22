import { Router } from 'express';
import { getGovernmentGuide } from '../controllers/government.controller';
import { asyncHandler } from '../middleware/errorHandler';
// Note: Government routes don't require authentication as they provide general information

const router = Router();

// Government routes - no authentication required for general information
router.get('/guide', asyncHandler(getGovernmentGuide));
// Note: We could add more government-related routes here if needed

export default router;