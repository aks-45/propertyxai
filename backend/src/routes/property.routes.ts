import { Router } from 'express';
import {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
} from '../controllers/property.controller';
import { getPropertyLocationIntelligence } from '../controllers/location.controller';
import { analyzeProperty } from '../controllers/analysis.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Property CRUD routes
router.post('/', asyncHandler(createProperty));
router.get('/', asyncHandler(getProperties));
router.get('/:id', asyncHandler(getPropertyById));
router.put('/:id', asyncHandler(updateProperty));
router.delete('/:id', asyncHandler(deleteProperty));

// Sub-routes for property intelligence & analysis
router.get('/:id/location-intelligence', asyncHandler(getPropertyLocationIntelligence));
router.post('/:propertyId/analyze', asyncHandler(analyzeProperty));

export default router;