import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { GovernmentService } from '../services/government/service';

const governmentService = new GovernmentService();

const governmentGuideRequestSchema = z.object({
  buyerState: z.string().default('UP'),
  buyerCity: z.string().optional(),
  buyerStatus: z.string().default('Indian Citizen / Resident'),
  propertyState: z.string().default('UP'),
  propertyCity: z.string().optional(),
  propertyAddress: z.string().optional(),
  propertyType: z.string().default('flat'),
  purchasePurpose: z.string().default('live'),
});

/**
 * Get government guidance, registration rules, stamp duty & RERA portal links
 * GET /api/government/guide or GET /api/government-guide
 */
export const getGovernmentGuide = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = governmentGuideRequestSchema.parse(req.query);

    const guide = await governmentService.getGovernmentGuide({
      buyerState: validatedData.buyerState,
      buyerCity: validatedData.buyerCity,
      buyerStatus: validatedData.buyerStatus,
      propertyState: validatedData.propertyState,
      propertyCity: validatedData.propertyCity,
      propertyAddress: validatedData.propertyAddress || 'Target Property',
      propertyType: validatedData.propertyType,
      purchasePurpose: validatedData.purchasePurpose,
    });

    res.status(200).json({
      success: true,
      data: guide,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError || error.issues) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid government guide query parameters',
          details: error.issues || error.errors,
        },
      });
    }
    next(error);
  }
};