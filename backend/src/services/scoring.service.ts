import { FinancialMetrics } from './financial.service';
import { LocationIntelligence } from './google/maps.service';

export interface CommuteAnalysis {
  workLocation?: string;
  distanceKm?: number;
  durationMins?: number;
  distanceText?: string;
  durationText?: string;
  rating: 'EXCELLENT' | 'MANAGEABLE' | 'STRETCHED' | 'EXCESSIVE' | 'NOT_SPECIFIED';
  scorePenalty: number;
  scoreBonus: number;
  summary: string;
  monthlyTravelCostEst: number;
  annualCommuteHours: number;
  suggestions: string[];
}

export interface Scores {
  overall: number;
  location: number;
  affordability: number;
  connectivity: number;
  infrastructure: number;
  healthcare: number;
  education: number;
  daily_convenience: number;
  environment: number;
  rental_potential: number;
  growth: number;
  future: number;
  buy: number;
  rent: number;
  wait: number;
  commute?: CommuteAnalysis;
}

export interface ScoringWeights {
  affordability: number;
  connectivity: number;
  healthcare: number;
  education: number;
  daily_convenience: number;
  environment: number;
  rental_potential: number;
  growth: number;
}

const DEFAULT_WEIGHTS: ScoringWeights = {
  affordability: 0.35, // Increased weight to 35%
  connectivity: 0.15,
  healthcare: 0.10,
  education: 0.10,
  daily_convenience: 0.10,
  environment: 0.08,
  rental_potential: 0.06,
  growth: 0.06,
};

export class ScoringService {
  private weights: ScoringWeights;

  constructor(customWeights?: Partial<ScoringWeights>) {
    this.weights = { ...DEFAULT_WEIGHTS, ...customWeights };
  }

  /**
   * Deterministic calculation of multi-dimensional property scores with strict financial gating & commute analysis
   */
  async calculateScores(input: {
    property: {
      price: number;
      area: number;
      areaUnit?: string;
      type?: string;
      purpose?: string;
      amenities?: string[];
      age?: string;
      moveTimeline?: string;
      monthlySalary?: number;
      monthlyExpenses?: number;
      availableIncome?: number;
      savings?: any;
    };
    locationData: LocationIntelligence;
    financialMetrics: FinancialMetrics;
    user?: any;
  }): Promise<Scores> {
    const { property, locationData, financialMetrics } = input;

    // Commute Analysis (workplace distance & duration evaluation)
    const commute = this.calculateCommuteAnalysis(locationData, property.purpose || 'live');

    // 1. Strict Affordability Score (0-100)
    const affordabilityScore = this.calculateStrictAffordabilityScore(property, financialMetrics);

    // 2. Connectivity Score (0-100) - Factoring commute distance penalty/bonus
    const connectivityScore = this.calculateConnectivityScore(locationData, commute);

    // 3. Healthcare Score (0-100)
    const healthcareScore = this.calculateHealthcareScore(locationData);

    // 4. Education Score (0-100)
    const educationScore = this.calculateEducationScore(locationData);

    // 5. Daily Convenience Score (0-100)
    const dailyConvenienceScore = this.calculateDailyConvenienceScore(locationData);

    // 6. Environment Score (0-100)
    const environmentScore = this.calculateEnvironmentScore(locationData);

    // 7. Rental Potential Score (0-100)
    const rentalPotentialScore = this.calculateRentalPotentialScore(property, locationData);

    // 8. Capital Growth Potential Score (0-100)
    const growthScore = this.calculateGrowthScore(property, locationData);

    // Baseline weighted sum
    let rawOverall = Math.round(
      affordabilityScore * this.weights.affordability +
      connectivityScore * this.weights.connectivity +
      healthcareScore * this.weights.healthcare +
      educationScore * this.weights.education +
      dailyConvenienceScore * this.weights.daily_convenience +
      environmentScore * this.weights.environment +
      rentalPotentialScore * this.weights.rental_potential +
      growthScore * this.weights.growth
    );

    // WORKPLACE COMMUTE DESCORING PENALTY:
    // If buying for living (end-use) and commute is EXCESSIVE (>30km / >70 mins), apply a direct overall score descore penalty
    if ((property.purpose === 'live' || !property.purpose) && commute.rating === 'EXCESSIVE') {
      rawOverall = Math.max(15, rawOverall - 10); // Deduct 10 points directly for extreme commute fatigue
    } else if ((property.purpose === 'live' || !property.purpose) && commute.rating === 'STRETCHED') {
      rawOverall = Math.max(15, rawOverall - 4);
    }

    // BALANCED FINANCIAL GATING RULE:
    // Only cap overall score if the buyer is genuinely insolvent / severely cash-strapped
    let overall = rawOverall;
    if (affordabilityScore <= 15) {
      overall = Math.min(rawOverall, 25);
    } else if (affordabilityScore <= 30) {
      overall = Math.min(rawOverall, 42);
    } else if (affordabilityScore <= 44) {
      overall = Math.min(rawOverall, 52);
    }

    // Frontend composite aliases
    const locationScore = Math.round((connectivityScore * 0.4 + healthcareScore * 0.3 + dailyConvenienceScore * 0.3));
    const infrastructureScore = Math.round((educationScore * 0.5 + healthcareScore * 0.5));
    const futureScore = Math.round((growthScore * 0.6 + rentalPotentialScore * 0.4));

    // Decision-specific scores
    let buyScore: number;
    let rentScore: number;
    let waitScore: number;

    if (affordabilityScore >= 68 && overall >= 70 && commute.rating !== 'EXCESSIVE') {
      buyScore = Math.min(95, overall + 5);
      rentScore = Math.max(25, 80 - overall);
      waitScore = Math.max(20, 70 - overall);
    } else if (affordabilityScore < 48 && overall < 50) {
      buyScore = Math.max(5, affordabilityScore);
      rentScore = 88;
      waitScore = 55;
    } else {
      // WAIT Zone (Overall 50 - 69 or Affordability 48 - 67)
      buyScore = 52;
      rentScore = 58;
      waitScore = 85;
    }

    return {
      affordability: affordabilityScore,
      connectivity: connectivityScore,
      healthcare: healthcareScore,
      education: educationScore,
      daily_convenience: dailyConvenienceScore,
      environment: environmentScore,
      rental_potential: rentalPotentialScore,
      growth: growthScore,
      overall,
      location: locationScore,
      infrastructure: infrastructureScore,
      future: futureScore,
      buy: buyScore,
      rent: rentScore,
      wait: waitScore,
      commute,
    };
  }

  public calculateCommuteAnalysis(location: LocationIntelligence, purpose: string = 'live'): CommuteAnalysis {
    if (purpose === 'investment') {
      return {
        rating: 'NOT_SPECIFIED',
        scorePenalty: 0,
        scoreBonus: 0,
        summary: 'Investment Asset: Personal commute distance is exempt.',
        monthlyTravelCostEst: 0,
        annualCommuteHours: 0,
        suggestions: [
          'Investment assets are evaluated based on capital appreciation velocity, rental yield potential, and micro-market growth corridors rather than daily personal commute.',
        ],
      };
    }

    const workplaceRoute = location.routes?.workplace;
    if (!workplaceRoute || !workplaceRoute.destination) {
      return {
        rating: 'NOT_SPECIFIED',
        scorePenalty: 0,
        scoreBonus: 0,
        summary: 'Workplace location not specified. Commute impact not factored.',
        monthlyTravelCostEst: 0,
        annualCommuteHours: 0,
        suggestions: ['Enter your office or workplace location to receive personalized commute time, travel cost calculations, and transit suggestions.'],
      };
    }

    const distanceKm = Number(((workplaceRoute.distanceValue || 0) / 1000).toFixed(1));
    const durationMins = Math.round((workplaceRoute.durationValue || 0) / 60);
    const distanceText = workplaceRoute.distance || `${distanceKm} km`;
    const durationText = workplaceRoute.duration || `${durationMins} mins`;
    const workLocation = workplaceRoute.destination;

    let rating: 'EXCELLENT' | 'MANAGEABLE' | 'STRETCHED' | 'EXCESSIVE' = 'MANAGEABLE';
    let scoreBonus = 0;
    let scorePenalty = 0;
    let summary = '';
    let monthlyTravelCostEst = 4500;
    const annualCommuteHours = Math.round((durationMins * 2 * 240) / 60);
    const suggestions: string[] = [];

    if (durationMins <= 25 || distanceKm <= 8) {
      rating = 'EXCELLENT';
      scoreBonus = 10;
      scorePenalty = 0;
      monthlyTravelCostEst = 2200;
      summary = `Optimal Work Commute: Just ${distanceText} (${durationText}) from ${workLocation}.`;
      suggestions.push('Minimal daily travel fatigue saves approx 1.5+ hours every workday.');
      suggestions.push('Accessible via low-cost micro-mobility, cycling, or quick arterial drive.');
    } else if (durationMins <= 45 || distanceKm <= 18) {
      rating = 'MANAGEABLE';
      scoreBonus = 0;
      scorePenalty = -5;
      monthlyTravelCostEst = 5500;
      summary = `Manageable Daily Commute: ${distanceText} (${durationText}) to ${workLocation}.`;
      suggestions.push('Standard metro-city commute. Good balance of neighborhood value and accessibility.');
      suggestions.push('Check direct metro feeder bus or carpool options for peak rush hours.');
    } else if (durationMins <= 70 || distanceKm <= 30) {
      rating = 'STRETCHED';
      scoreBonus = 0;
      scorePenalty = -18;
      monthlyTravelCostEst = 9500;
      summary = `Stretched Work Commute: ${distanceText} (${durationText}) to ${workLocation}. Significant daily travel burden.`;
      suggestions.push(`High travel overhead: You will spend ~${annualCommuteHours} hours per year in transit with ~₹${monthlyTravelCostEst.toLocaleString('en-IN')}/mo in fuel/cabs.`);
      suggestions.push('Explore properties along the direct express metro/highway corridor or consider a hybrid work arrangement (2-3 days WFH).');
    } else {
      rating = 'EXCESSIVE';
      scoreBonus = 0;
      scorePenalty = -32;
      monthlyTravelCostEst = 14500;
      summary = `⚠️ Excessive Work Commute Warning: Workplace is ${distanceText} (${durationText}) away. Severe travel burnout risk.`;
      suggestions.push(`Extreme commute: Daily 2.5+ hours roundtrip (~${annualCommuteHours} hours/yr) and ₹${monthlyTravelCostEst.toLocaleString('en-IN')}/mo recurring travel expense.`);
      suggestions.push('For primary self-use (living), we strongly advise looking within a 15km radius of your workplace or renting closer to your job hub.');
      suggestions.push('If buying purely for investment/rental income, this personal commute penalty can be disregarded.');
    }

    return {
      workLocation,
      distanceKm,
      durationMins,
      distanceText,
      durationText,
      rating,
      scorePenalty,
      scoreBonus,
      summary,
      monthlyTravelCostEst,
      annualCommuteHours,
      suggestions,
    };
  }

  private calculateStrictAffordabilityScore(property: any, financial: FinancialMetrics): number {
    const isFullPayment = property.details?.paymentMode === 'full' || property.paymentMode === 'full';
    if (isFullPayment) {
      const monthlyIncome = property.monthlySalary || financial.monthlyIncome || 0;
      const monthlyExpenses = property.monthlyExpenses || financial.monthlyExpenses || 0;
      const surplus = monthlyIncome - monthlyExpenses;
      return surplus >= 0 ? 96 : 70;
    }

    const price = property.price || 5000000;
    const emi = financial.costEstimation?.monthlyEMI || (price * 0.8 * 0.008678); // Approx EMI
    const upfrontRequired = price * 0.27; // 20% down payment + 7% stamp & registration

    let score = 50;

    // 1. Check Available Monthly Surplus / Income vs EMI
    const monthlyIncome = property.monthlySalary || financial.monthlyIncome;
    const monthlyExpenses = property.monthlyExpenses || financial.monthlyExpenses || 0;
    const availableMonthlySavings = property.availableIncome !== undefined
      ? property.availableIncome
      : (monthlyIncome ? Math.max(0, monthlyIncome - monthlyExpenses) : null);

    if (availableMonthlySavings !== null) {
      if (availableMonthlySavings <= 0) {
        return 5; // Insolvent / zero savings capacity
      }

      const emiToSurplusRatio = emi / availableMonthlySavings;

      if (emiToSurplusRatio > 3.0) {
        // Severe debt burden (>300% of available monthly savings)
        return 12;
      } else if (emiToSurplusRatio > 1.8) {
        // EMI is more than 180% of available monthly savings
        return 24;
      } else if (emiToSurplusRatio > 1.35) {
        // EMI is 135-180% of monthly savings
        score = 38;
      } else if (emiToSurplusRatio > 1.10) {
        // EMI is 110-135% of monthly savings (WAIT zone - need slightly more down payment buffer)
        score = 54;
      } else if (emiToSurplusRatio > 0.85) {
        // EMI takes 85-110% of monthly savings (WAIT / Moderate Accumulation)
        score = 62;
      } else if (emiToSurplusRatio > 0.65) {
        // EMI takes 65-85% of savings (Healthy BUY)
        score = 75;
      } else if (emiToSurplusRatio > 0.40) {
        // EMI takes 40-65% of savings (Comfortable BUY)
        score = 85;
      } else if (emiToSurplusRatio > 0.20) {
        // Highly comfortable (e.g. ₹29.8k EMI on ₹93k monthly savings = 0.32 ratio!)
        score = 92;
      } else {
        // Prime ultra-safe affordability (savings > 5x EMI)
        score = 96;
      }
    }

    // 2. Timeline & Down Payment Accumulation Gap Check
    let timelineMonths = 6;
    if (property.moveTimeline === 'immediate' || property.moveTimeline === '0-3') timelineMonths = 3;
    else if (property.moveTimeline === 'within-6-months' || property.moveTimeline === '3-6') timelineMonths = 6;
    else if (property.moveTimeline === '6-12') timelineMonths = 12;
    else if (property.moveTimeline === '1-2-years') timelineMonths = 24;

    if (availableMonthlySavings !== null && availableMonthlySavings > 0) {
      const existingSavings = property.savings?.total || 0;
      const accumulatedSavingsByTimeline = existingSavings + (availableMonthlySavings * timelineMonths);
      const savingsToDownPaymentRatio = accumulatedSavingsByTimeline / upfrontRequired;
      const emiRatio = emi / availableMonthlySavings;

      // Moderate adjustment if downpayment is still accumulating
      if (savingsToDownPaymentRatio < 0.25 && emiRatio > 1.0) {
        score = Math.max(25, score - 6);
      } else if (savingsToDownPaymentRatio < 0.40 && emiRatio > 0.8) {
        score = Math.max(35, score - 3);
      }
    }

    // 3. Gross Debt-to-Income (DTI) Check if monthly income is known
    if (monthlyIncome && monthlyIncome > 0) {
      const dti = emi / monthlyIncome;
      if (dti > 0.75) score = Math.min(score, 18);
      else if (dti > 0.65) score = Math.min(score, 32);
      else if (dti > 0.55) score = Math.min(score, 52);
      else if (dti > 0.45) score = Math.min(score, 68);
      else if (dti > 0.35) score = Math.min(score, 82);
    }

    return Math.min(100, Math.max(5, Math.round(score)));
  }

  private calculateConnectivityScore(location: LocationIntelligence, commute?: CommuteAnalysis): number {
    let score = 75;
    const routes = location.routes;

    if (routes.transitAccess) score += 10;
    if (routes.highwayAccess) score += 5;

    if (routes.cityCenter?.durationValue) {
      const minutes = routes.cityCenter.durationValue / 60;
      if (minutes <= 20) score += 10;
      else if (minutes > 50) score -= 10;
    }

    // Apply workplace commute bonus or penalty
    if (commute && commute.rating !== 'NOT_SPECIFIED') {
      score += commute.scoreBonus;
      score += commute.scorePenalty;
    }

    return Math.min(100, Math.max(15, score));
  }

  private calculateHealthcareScore(location: LocationIntelligence): number {
    const places = location.nearbyPlaces || [];
    const hospitals = places.filter(p => (p.type || '').toLowerCase().includes('hospital') || (p.type || '').toLowerCase().includes('clinic'));
    const pharmacies = places.filter(p => (p.type || '').toLowerCase().includes('pharmacy'));

    let score = 70;
    if (hospitals.length > 0) score += 15;
    if (pharmacies.length > 0) score += 10;

    return Math.min(100, Math.max(20, score));
  }

  private calculateEducationScore(location: LocationIntelligence): number {
    const places = location.nearbyPlaces || [];
    const schools = places.filter(p => (p.type || '').toLowerCase().includes('school') || (p.type || '').toLowerCase().includes('college'));

    let score = 70;
    if (schools.length >= 2) score += 20;
    else if (schools.length === 1) score += 10;

    return Math.min(100, Math.max(20, score));
  }

  private calculateDailyConvenienceScore(location: LocationIntelligence): number {
    const places = location.nearbyPlaces || [];
    const markets = places.filter(p => (p.type || '').toLowerCase().includes('market') || (p.type || '').toLowerCase().includes('supermarket'));
    const banks = places.filter(p => (p.type || '').toLowerCase().includes('bank') || (p.type || '').toLowerCase().includes('atm'));

    let score = 70;
    if (markets.length > 0) score += 15;
    if (banks.length > 0) score += 10;

    return Math.min(100, Math.max(20, score));
  }

  private calculateEnvironmentScore(location: LocationIntelligence): number {
    const aqi = location.airQuality?.aqi || 80;
    if (aqi <= 50) return 92;
    if (aqi <= 100) return 80;
    if (aqi <= 150) return 68;
    if (aqi <= 200) return 55;
    return 40;
  }

  private calculateRentalPotentialScore(property: any, location: LocationIntelligence): number {
    let score = 75;
    if (location.routes.transitAccess) score += 8;
    if (property.type === 'flat' || property.type === 'apartment') score += 5;
    if (property.amenities && property.amenities.length >= 4) score += 7;
    return Math.min(100, Math.max(25, score));
  }

  private calculateGrowthScore(property: any, location: LocationIntelligence): number {
    let score = 78;
    if (location.routes.highwayAccess) score += 6;
    if (property.type === 'residential_land' || property.type === 'land') score += 8;
    return Math.min(100, Math.max(25, score));
  }
}