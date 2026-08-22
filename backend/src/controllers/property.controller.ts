import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { z } from 'zod';

const propertyInputSchema = z.object({
  name: z.string().optional(),
  type: z.enum(['land', 'flat', 'house', 'commercial', 'apartment', 'residential_land', 'agricultural_land', 'other']).optional(),
  propertyType: z.string().optional(),
  location: z.string().optional(),
  locationDetails: z.object({
    address: z.string(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
  }).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  district: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  price: z.number().nonnegative(),
  area: z.number().nonnegative(),
  areaUnit: z.enum(['sqft', 'sqm', 'sqyd']).default('sqft'),
  purpose: z.enum(['live', 'investment', 'business', 'rent']).optional(),
  purchasePurpose: z.string().optional(),
  age: z.string().optional(),
  floor: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  moveTimeline: z.string().optional(),
  constructionStatus: z.string().optional(),
  newOrResale: z.string().optional(),
  builderSellerType: z.string().optional(),
});

/**
 * Create a new property
 * POST /api/properties
 */
export const createProperty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const validatedData = propertyInputSchema.parse(req.body);

    const address = validatedData.locationDetails?.address || validatedData.address || validatedData.location || 'Unknown Address';
    const city = validatedData.locationDetails?.city || validatedData.city || 'Unknown City';
    const state = validatedData.locationDetails?.state || validatedData.state || 'Unknown State';
    const lat = validatedData.locationDetails?.lat ?? validatedData.latitude ?? null;
    const lng = validatedData.locationDetails?.lng ?? validatedData.longitude ?? null;
    const propType = validatedData.type || validatedData.propertyType || 'flat';
    const purpose = validatedData.purpose || validatedData.purchasePurpose || 'live';

    const property = await prisma.property.create({
      data: {
        userId,
        address,
        city,
        state,
        district: validatedData.district || null,
        latitude: lat,
        longitude: lng,
        propertyType: propType,
        purchasePurpose: purpose,
        price: validatedData.price,
        area: validatedData.area,
        areaUnit: validatedData.areaUnit,
        constructionStatus: validatedData.constructionStatus || validatedData.age || 'ready_to_move',
        newOrResale: validatedData.newOrResale || 'resale',
        builderSellerType: validatedData.builderSellerType || null,
      },
    });

    res.status(201).json({
      success: true,
      data: property,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError || error.issues) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid property input',
          details: error.issues || error.errors,
        },
      });
    }
    next(error);
  }
};

/**
 * Get all properties for the authenticated user
 * GET /api/properties
 */
export const getProperties = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;

    const properties = await prisma.property.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        analyses: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            decision: true,
            confidence: true,
            scores: true,
            createdAt: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: properties,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific property by ID
 * GET /api/properties/:id
 */
export const getPropertyById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const id = req.params.id as string;

    const property = await prisma.property.findFirst({
      where: { id, userId },
      include: {
        analyses: {
          orderBy: { createdAt: 'desc' },
        },
      },
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

    res.status(200).json({
      success: true,
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a property
 * PUT /api/properties/:id
 */
export const updateProperty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const id = req.params.id as string;

    const existing = await prisma.property.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROPERTY_NOT_FOUND',
          message: 'Property not found or access denied',
        },
      });
    }

    const validatedData = propertyInputSchema.partial().parse(req.body);

    const updateData: any = {};
    if (validatedData.price !== undefined) updateData.price = validatedData.price;
    if (validatedData.area !== undefined) updateData.area = validatedData.area;
    if (validatedData.areaUnit !== undefined) updateData.areaUnit = validatedData.areaUnit;
    if (validatedData.type || validatedData.propertyType) updateData.propertyType = validatedData.type || validatedData.propertyType;
    if (validatedData.purpose || validatedData.purchasePurpose) updateData.purchasePurpose = validatedData.purpose || validatedData.purchasePurpose;
    if (validatedData.locationDetails?.address || validatedData.address) {
      updateData.address = validatedData.locationDetails?.address || validatedData.address;
    }
    if (validatedData.locationDetails?.city || validatedData.city) {
      updateData.city = validatedData.locationDetails?.city || validatedData.city;
    }
    if (validatedData.locationDetails?.state || validatedData.state) {
      updateData.state = validatedData.locationDetails?.state || validatedData.state;
    }
    if (validatedData.locationDetails?.lat !== undefined) updateData.latitude = validatedData.locationDetails.lat;
    if (validatedData.locationDetails?.lng !== undefined) updateData.longitude = validatedData.locationDetails.lng;

    const updated = await prisma.property.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError || error.issues) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid property update input',
          details: error.issues || error.errors,
        },
      });
    }
    next(error);
  }
};

/**
 * Delete a property
 * DELETE /api/properties/:id
 */
export const deleteProperty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const id = req.params.id as string;

    const existing = await prisma.property.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROPERTY_NOT_FOUND',
          message: 'Property not found or access denied',
        },
      });
    }

    await prisma.property.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: 'Property deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};