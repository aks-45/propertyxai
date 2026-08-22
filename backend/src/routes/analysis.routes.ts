import { Router } from 'express';
import {
  analyzeProperty,
  getAnalyses,
  getAnalysisById,
} from '../controllers/analysis.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router({ mergeParams: true });

// All analysis endpoints require JWT authentication
router.use(authenticateToken);

// Support both /api/analyses and /api/properties/:propertyId/analyze
router.post('/', asyncHandler(analyzeProperty));
router.post('/analyze', asyncHandler(analyzeProperty));
router.get('/', asyncHandler(getAnalyses));
router.get('/:id', asyncHandler(getAnalysisById));

export default router;