import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../config/database';
import { GoogleMapsService } from '../services/google/maps.service';

const googleMapsService = new GoogleMapsService();

const geocodeSchema = z.object({
  address: z.string().min(1),
});

const reverseGeocodeSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

const autocompleteSchema = z.object({
  query: z.string().optional().default(''),
});

const intelligenceSchema = z.object({
  address: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  workplaceLocation: z.string().optional(),
});

/**
 * Geocode an address into coordinates and administrative details
 * POST /api/location/geocode
 */
export const geocodeAddress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = geocodeSchema.parse(req.body);
    const geocodingResult = await googleMapsService.geocodeAddress(validatedData.address);

    res.status(200).json({
      success: true,
      data: geocodingResult,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError || error.issues) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid geocode request',
          details: error.issues || error.errors,
        },
      });
    }
    next(error);
  }
};

/**
 * Reverse geocode GPS coordinates into human-readable address
 * POST /api/location/reverse-geocode
 */
export const reverseGeocode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = reverseGeocodeSchema.parse(req.body);
    const result = await googleMapsService.reverseGeocode(validatedData.lat, validatedData.lng);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError || error.issues) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid coordinates provided for reverse geocoding',
          details: error.issues || error.errors,
        },
      });
    }
    next(error);
  }
};

/**
 * Autocomplete address and locality predictions
 * GET /api/location/autocomplete or POST /api/location/autocomplete
 */
export const autocompletePlaces = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = (req.query.query || req.body.query || '') as string;
    const predictions = await googleMapsService.autocompletePlaces(query);

    res.status(200).json({
      success: true,
      data: predictions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search any custom amenity (e.g. Gym, EV, Cinema, Temple, Park) within 5km radius
 * POST /api/location/search-amenities or GET /api/location/search-amenities
 */
export const searchCustomAmenity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lat = Number(req.query.lat || req.body.lat || 28.5355);
    const lng = Number(req.query.lng || req.body.lng || 77.3910);
    const query = (req.query.query || req.body.query || '') as string;

    const places = await googleMapsService.searchCustomAmenity(lat, lng, query);

    res.status(200).json({
      success: true,
      data: places,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get comprehensive location intelligence for a location
 * POST /api/location/intelligence or POST /api/location
 */
export const getLocationIntelligence = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = intelligenceSchema.parse(req.body);
    let { address, lat, lng, city, state, workplaceLocation } = validatedData;

    if ((lat === undefined || lng === undefined) && address) {
      const geocoded = await googleMapsService.geocodeAddress(address);
      lat = geocoded.lat;
      lng = geocoded.lng;
      city = city || geocoded.city;
      state = state || geocoded.state;
    }

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'LOCATION_REQUIRED',
          message: 'Either coordinates (lat/lng) or an address must be provided',
        },
      });
    }

    const locationIntelligence = await googleMapsService.getLocationIntelligence({
      lat,
      lng,
      address: address || 'Target Property Location',
      city: city || 'Noida',
      state: state || 'Uttar Pradesh',
      workplaceLocation,
    });

    res.status(200).json({
      success: true,
      data: locationIntelligence,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError || error.issues) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid location intelligence request',
          details: error.issues || error.errors,
        },
      });
    }
    next(error);
  }
};

/**
 * Get location intelligence for a specific saved property
 * GET /api/properties/:id/location-intelligence
 */
export const getPropertyLocationIntelligence = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const id = req.params.id as string;

    const property = await prisma.property.findFirst({
      where: { id, userId },
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROPERTY_NOT_FOUND',
          message: 'Property not found or access denied',
        },
      });
    }

    let lat = property.latitude;
    let lng = property.longitude;
    let city = property.city;
    let state = property.state;

    if (lat === null || lng === null || !city || !state) {
      const geocoded = await googleMapsService.geocodeAddress(property.address);
      lat = geocoded.lat;
      lng = geocoded.lng;
      city = city || geocoded.city;
      state = state || geocoded.state;

      // Update property with geocoded coordinates
      await prisma.property.update({
        where: { id: property.id },
        data: { latitude: lat, longitude: lng, city, state },
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { workplaceLocation: true },
    });

    const locationIntelligence = await googleMapsService.getLocationIntelligence({
      lat: lat || 28.5355,
      lng: lng || 77.3910,
      address: property.address,
      city: city || 'Noida',
      state: state || 'Uttar Pradesh',
      workplaceLocation: user?.workplaceLocation || undefined,
    });

    res.status(200).json({
      success: true,
      data: locationIntelligence,
    });
  } catch (error) {
    next(error);
  }
};