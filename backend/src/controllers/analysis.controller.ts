import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { z } from 'zod';
import { FinancialService } from '../services/financial.service';
import { ScoringService } from '../services/scoring.service';
import { DecisionService } from '../services/decision.service';
import { GeminiService } from '../services/ai/gemini.service';
import { GoogleMapsService } from '../services/google/maps.service';

const analysisRequestSchema = z.object({
  type: z.enum(['land', 'flat', 'house', 'commercial', 'apartment', 'residential_land', 'agricultural_land', 'other']).default('flat'),
  location: z.string().optional(),
  locationDetails: z.object({
    address: z.string(),
    lat: z.number().optional(),
    lng: z.number().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
  }).optional(),
  price: z.number().nonnegative(),
  area: z.number().nonnegative(),
  areaUnit: z.enum(['sqft', 'sqm', 'sqyd']).default('sqft'),
  purpose: z.enum(['live', 'investment', 'business', 'rent']).default('live'),
  age: z.string().optional(),
  floor: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  moveTimeline: z.enum(['within-6-months', '6-12-months', '1-2-years', 'not-sure']).optional(),
  monthlySalary: z.number().int().nonnegative().optional(),
  monthlyExpenses: z.number().int().nonnegative().optional(),
  availableIncome: z.number().int().nonnegative().optional(),
  expenditures: z.record(
    z.string(),
    z.object({
      status: z.enum(['amount', 'unknown', 'none']),
      amount: z.number().int().nonnegative().optional(),
    })
  ).optional(),
  savings: z.record(
    z.string(),
    z.object({
      status: z.enum(['amount', 'unknown', 'none']),
      amount: z.number().int().nonnegative().optional(),
    })
  ).optional(),
  workLocation: z.string().optional(),
  workplaceLocation: z.string().optional(),
  paymentMode: z.string().optional(),
  details: z.any().optional(),
});

const financialService = new FinancialService();
const scoringService = new ScoringService();
const decisionService = new DecisionService();
const geminiService = new GeminiService();
const googleMapsService = new GoogleMapsService();

/**
 * Run comprehensive analysis pipeline on a property
 * POST /api/properties/:propertyId/analyze or POST /api/analyses
 */
export const analyzeProperty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    let propertyId = (req.params.propertyId || req.body.propertyId) as string | undefined;

    const validatedData = analysisRequestSchema.parse(req.body);

    // 1. Get or create Property record
    let property: any = null;
    if (propertyId) {
      property = await prisma.property.findFirst({
        where: { id: propertyId, userId },
      });
    }

    const address = validatedData.locationDetails?.address || validatedData.location || (property ? property.address : 'Unknown Address');

    // 2. Geocode if coordinates are not provided
    let lat = validatedData.locationDetails?.lat ?? (property?.latitude ?? undefined);
    let lng = validatedData.locationDetails?.lng ?? (property?.longitude ?? undefined);
    let city = validatedData.locationDetails?.city ?? (property?.city ?? undefined);
    let state = validatedData.locationDetails?.state ?? (property?.state ?? undefined);

    if (lat === undefined || lng === undefined || !city || !state) {
      const geocoded = await googleMapsService.geocodeAddress(address);
      lat = geocoded.lat;
      lng = geocoded.lng;
      city = city || geocoded.city;
      state = state || geocoded.state;
    }

    // If property didn't exist in DB, create it now for the user
    if (!property) {
      property = await prisma.property.create({
        data: {
          userId,
          address,
          city,
          state,
          latitude: lat,
          longitude: lng,
          propertyType: validatedData.type,
          purchasePurpose: validatedData.purpose,
          price: validatedData.price,
          area: validatedData.area,
          areaUnit: validatedData.areaUnit,
          constructionStatus: validatedData.age || 'ready_to_move',
        },
      });
      propertyId = property.id;
    }

    // 3. Load user & financial profile (fallback to profile in DB if not passed in body)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { financialProfile: true },
    });

    const mergedExpenditures = validatedData.expenditures || (user?.financialProfile?.expenditures as any) || {};
    const mergedSavings = validatedData.savings || (user?.financialProfile?.savings as any) || {};
    const mergedIncome = validatedData.monthlySalary ?? (user?.financialProfile?.monthlyIncome ?? undefined);

    // 4. Retrieve Google location intelligence (cached & resilient)
    const locationData = await googleMapsService.getLocationIntelligence({
      lat,
      lng,
      address,
      city: city || 'Noida',
      state: state || 'Uttar Pradesh',
      workplaceLocation: validatedData.workLocation || validatedData.workplaceLocation || user?.workplaceLocation || undefined,
    });

    // 5. Deterministic Financial Calculations (3-state expenses)
    const financialMetrics = await financialService.calculateFinancialMetrics({
      monthlyIncome: mergedIncome,
      monthlyExpenses: validatedData.monthlyExpenses,
      availableIncome: validatedData.availableIncome,
      expenditures: mergedExpenditures,
      savings: mergedSavings,
      propertyPrice: validatedData.price,
      propertyType: validatedData.type,
    });

    // 6. Deterministic Property Scoring
    const scores = await scoringService.calculateScores({
      property: {
        price: validatedData.price,
        area: validatedData.area,
        areaUnit: validatedData.areaUnit,
        type: validatedData.type,
        purpose: validatedData.purpose,
        amenities: validatedData.amenities,
        age: validatedData.age,
      },
      locationData,
      financialMetrics,
      user,
    });

    // 7. BUY / RENT / WAIT Decision
    const decision = await decisionService.makeDecision({
      scores,
      financialMetrics,
      locationData,
    });

    // 8. Gemini 2.5 Flash Structured Narrative
    const aiExplanation = await geminiService.generateExplanation({
      property: {
        ...validatedData,
        locationDetails: { address, city, state, lat, lng },
      },
      scores,
      decision,
      financialMetrics,
      locationData,
      user,
    });

    // 9. Store immutable snapshot in DB transaction
    const analysis = await prisma.analysis.create({
      data: {
        userId,
        propertyId: property.id,
        financialSnapshot: {
          monthlyIncome: financialMetrics.monthlyIncome,
          monthlyExpenses: financialMetrics.monthlyExpenses,
          availableIncome: financialMetrics.availableIncome,
          knownExpenses: financialMetrics.knownExpenses,
          unknownExpenseCategories: financialMetrics.unknownExpenseCategories,
          knownSavings: financialMetrics.knownSavings,
          estimatedPropertyCapacity: financialMetrics.estimatedPropertyCapacity,
          financialConfidence: financialMetrics.financialConfidence,
          costEstimation: financialMetrics.costEstimation,
          futureProjections: financialMetrics.futureProjections,
        } as any,
        locationSnapshot: {
          lat,
          lng,
          address,
          city,
          state,
          nearbyPlaces: locationData.nearbyPlaces,
          routes: locationData.routes,
          airQuality: locationData.airQuality,
        } as any,
        scores: scores as any,
        decision: decision.decision,
        confidence: decision.confidence,
        aiExplanation: aiExplanation as any,
      },
    });

    // 10. Format and return response perfectly matching frontend AnalysisResult type
    const responsePayload = {
      id: analysis.id,
      propertyId: property.id,
      propertyInput: {
        type: validatedData.type,
        location: address,
        locationDetails: {
          address,
          lat,
          lng,
          city: city || 'Unknown',
          state: state || 'Unknown',
        },
        price: validatedData.price,
        area: validatedData.area,
        areaUnit: validatedData.areaUnit,
        purpose: validatedData.purpose,
        age: validatedData.age || 'New',
        floor: validatedData.floor || 'Ground',
        amenities: validatedData.amenities || [],
        moveTimeline: validatedData.moveTimeline || 'within-6-months',
        monthlySalary: financialMetrics.monthlyIncome || undefined,
        monthlyExpenses: financialMetrics.monthlyExpenses || undefined,
        availableIncome: financialMetrics.availableIncome || undefined,
        expenditures: mergedExpenditures,
        savings: mergedSavings,
        paymentMode: validatedData.paymentMode || (validatedData.details as any)?.paymentMode || 'emi',
        details: validatedData.details,
      },
      scores,
      recommendation: decision.decision,
      confidence: decision.confidence,
      costEstimation: financialMetrics.costEstimation,
      futureProjections: financialMetrics.futureProjections,
      risks: financialMetrics.risks,
      breakDecision: decision.breakDecision,
      nearbyPlaces: locationData.nearbyPlaces,
      reasonsForRecommendation: decision.reasons,
      potentialRisks: decision.risks,
      aiExplanation,
      createdAt: analysis.createdAt.toISOString(),
    };

    res.status(200).json({
      success: true,
      data: responsePayload,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError || error.issues) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid analysis input data',
          details: error.issues || error.errors,
        },
      });
    }
    next(error);
  }
};

/**
 * Get all historical analyses for the user
 * GET /api/analyses
 */
export const getAnalyses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;

    const analyses = await prisma.analysis.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        property: true,
      },
    });

    res.status(200).json({
      success: true,
      data: analyses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific analysis by ID with immutable snapshot
 * GET /api/analyses/:id
 */
export const getAnalysisById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    const id = req.params.id as string;

    const analysis = await prisma.analysis.findFirst({
      where: { id, userId },
      include: {
        property: true,
      },
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ANALYSIS_NOT_FOUND',
          message: 'Analysis record not found',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
};