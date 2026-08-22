import { Router } from 'express';
import {
  geocodeAddress,
  reverseGeocode,
  autocompletePlaces,
  searchCustomAmenity,
  getLocationIntelligence,
} from '../controllers/location.controller';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Public location services
router.post('/geocode', asyncHandler(geocodeAddress));
router.post('/reverse-geocode', asyncHandler(reverseGeocode));
router.get('/autocomplete', asyncHandler(autocompletePlaces));
router.post('/autocomplete', asyncHandler(autocompletePlaces));
router.get('/search-amenities', asyncHandler(searchCustomAmenity));
router.post('/search-amenities', asyncHandler(searchCustomAmenity));
router.post('/intelligence', asyncHandler(getLocationIntelligence));
router.post('/', asyncHandler(getLocationIntelligence));

export default router;