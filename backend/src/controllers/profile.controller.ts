import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  currentState: z.string().optional(),
  currentCity: z.string().optional(),
  residencyStatus: z.string().optional(),
  familySize: z.number().int().min(1).optional(),
  purposeOfProperty: z.string().optional(),
  workplaceLocation: z.string().optional(),
  // Financial profile fields
  monthlyIncome: z.number().int().nonnegative().optional(),
  existingEmi: z.number().int().nonnegative().optional(),
  expenditures: z.record(z.string(), z.object({
    status: z.enum(['amount', 'unknown', 'none']),
    amount: z.number().int().nonnegative().optional(),
  })).optional(),
  savings: z.record(z.string(), z.object({
    status: z.enum(['amount', 'unknown', 'none']),
    amount: z.number().int().nonnegative().optional(),
  })).optional(),
});

/**
 * Get user profile with associated financial profile
 * GET /api/profile
 */
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        currentState: true,
        currentCity: true,
        residencyStatus: true,
        familySize: true,
        purposeOfProperty: true,
        workplaceLocation: true,
        createdAt: true,
        updatedAt: true,
        financialProfile: {
          select: {
            id: true,
            monthlyIncome: true,
            expenditures: true,
            savings: true,
            existingEmi: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User profile not found',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user personal profile & financial profile
 * PUT /api/profile
 */
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const validatedData = updateProfileSchema.parse(req.body);

    const {
      monthlyIncome,
      existingEmi,
      expenditures,
      savings,
      ...userProfileData
    } = validatedData;

    // Update user profile fields if any provided
    if (Object.keys(userProfileData).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: userProfileData,
      });
    }

    // Update financial profile if financial fields provided
    if (
      monthlyIncome !== undefined ||
      existingEmi !== undefined ||
      expenditures !== undefined ||
      savings !== undefined
    ) {
      await prisma.financialProfile.upsert({
        where: { userId },
        update: {
          ...(monthlyIncome !== undefined && { monthlyIncome }),
          ...(existingEmi !== undefined && { existingEmi }),
          ...(expenditures !== undefined && { expenditures }),
          ...(savings !== undefined && { savings }),
          updatedAt: new Date(),
        },
        create: {
          userId,
          monthlyIncome: monthlyIncome || null,
          existingEmi: existingEmi || null,
          expenditures: expenditures || {},
          savings: savings || {},
        },
      });
    }

    // Return the updated user record
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        currentState: true,
        currentCity: true,
        residencyStatus: true,
        familySize: true,
        purposeOfProperty: true,
        workplaceLocation: true,
        createdAt: true,
        updatedAt: true,
        financialProfile: true,
      },
    });

    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError || error.issues) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid profile data',
          details: error.issues || error.errors,
        },
      });
    }
    next(error);
  }
};