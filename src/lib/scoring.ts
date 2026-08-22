import { AnalysisScores } from '../types/analysis';
import { PropertyInput } from '../types/property';
import { calculateEMI } from './calculations';

export function calculatePropertyScore(input: PropertyInput): AnalysisScores {
  const price = input.price || 5000000;
  const loanAmount = price * 0.8;
  const monthlyEMI = calculateEMI(loanAmount, 8.5, 20);
  const upfrontRequired = price * 0.27; // 20% down payment + 7% stamp/registration

  const monthlySalary = input.monthlySalary || 120000;
  const monthlyExpenses = input.monthlyExpenses || 40000;
  const availableMonthlySavings = input.availableIncome !== undefined
    ? input.availableIncome
    : Math.max(0, monthlySalary - monthlyExpenses);

  const isFullPayment = input.details?.paymentMode === 'full' || (input as any).paymentMode === 'full';

  // 1. Strict Affordability Calculation
  let affordabilityScore = 50;

  if (isFullPayment) {
    affordabilityScore = availableMonthlySavings >= 0 ? 96 : 70;
  } else if (availableMonthlySavings <= 0) {
    affordabilityScore = 5; // Fatal: zero or negative savings capacity
  } else {
    const emiToSurplusRatio = monthlyEMI / availableMonthlySavings;

    if (emiToSurplusRatio > 3.0) {
      affordabilityScore = 12;
    } else if (emiToSurplusRatio > 1.8) {
      affordabilityScore = 24;
    } else if (emiToSurplusRatio > 1.35) {
      affordabilityScore = 38;
    } else if (emiToSurplusRatio > 1.10) {
      affordabilityScore = 54;
    } else if (emiToSurplusRatio > 0.85) {
      affordabilityScore = 62;
    } else if (emiToSurplusRatio > 0.65) {
      affordabilityScore = 75;
    } else if (emiToSurplusRatio > 0.40) {
      affordabilityScore = 85;
    } else if (emiToSurplusRatio > 0.20) {
      affordabilityScore = 92;
    } else {
      affordabilityScore = 96;
    }
  }

  // 2. Timeline & Down Payment Accumulation Gap Check
  const timelineMonths = input.moveTimeline === 'within-6-months' ? 6 : input.moveTimeline === '6-12-months' ? 12 : 24;
  const projectedSavings = availableMonthlySavings * timelineMonths;
  const savingsToDownPaymentRatio = projectedSavings / upfrontRequired;
  const emiRatio = monthlyEMI / (availableMonthlySavings || 1);

  if (savingsToDownPaymentRatio < 0.25 && emiRatio > 1.0) {
    affordabilityScore = Math.max(25, affordabilityScore - 6);
  } else if (savingsToDownPaymentRatio < 0.40 && emiRatio > 0.8) {
    affordabilityScore = Math.max(35, affordabilityScore - 3);
  }

  // Gross Debt-to-Income (DTI) Check
  if (monthlySalary && monthlySalary > 0) {
    const dti = monthlyEMI / monthlySalary;
    if (dti > 0.75) affordabilityScore = Math.min(affordabilityScore, 18);
    else if (dti > 0.65) affordabilityScore = Math.min(affordabilityScore, 32);
    else if (dti > 0.55) affordabilityScore = Math.min(affordabilityScore, 52);
    else if (dti > 0.45) affordabilityScore = Math.min(affordabilityScore, 68);
    else if (dti > 0.35) affordabilityScore = Math.min(affordabilityScore, 82);
  }

  // Commute evaluation
  const commute = calculateCommuteMetrics(input);

  // Sub-scores
  let connectivity = 80;
  if (commute.rating !== 'NOT_SPECIFIED') {
    connectivity = Math.min(100, Math.max(15, connectivity + commute.scoreBonus + commute.scorePenalty));
  }

  const infrastructure = 75;
  const environment = 72;
  const future = 76;
  const location = 78;

  // 3. Composite Overall Score with Balanced Gating & Commute Penalty
  let rawOverall = Math.round(
    affordabilityScore * 0.35 +
    connectivity * 0.15 +
    infrastructure * 0.15 +
    environment * 0.10 +
    future * 0.15 +
    location * 0.10
  );

  if ((input.purpose === 'live' || !input.purpose) && commute.rating === 'EXCESSIVE') {
    rawOverall = Math.max(15, rawOverall - 10);
  } else if ((input.purpose === 'live' || !input.purpose) && commute.rating === 'STRETCHED') {
    rawOverall = Math.max(15, rawOverall - 4);
  }

  // BALANCED FINANCIAL GATING RULE:
  let overall = rawOverall;
  if (affordabilityScore <= 15) {
    overall = Math.min(rawOverall, 25);
  } else if (affordabilityScore <= 30) {
    overall = Math.min(rawOverall, 42);
  } else if (affordabilityScore <= 44) {
    overall = Math.min(rawOverall, 52);
  }

  const buy = (affordabilityScore >= 68 && overall >= 70 && commute.rating !== 'EXCESSIVE')
    ? Math.min(95, overall + 5)
    : Math.max(5, Math.min(affordabilityScore, 40));
  const rent = (affordabilityScore < 48 && overall < 50) ? 88 : 50;
  const wait = (overall >= 50 && overall < 70) || (affordabilityScore >= 48 && affordabilityScore < 68) ? 85 : 30;

  return {
    overall,
    location,
    affordability: affordabilityScore,
    connectivity,
    infrastructure,
    environment,
    future,
    buy,
    rent,
    wait,
  };
}

export function calculateCommuteMetrics(input: PropertyInput) {
  if (input.purpose === 'investment') {
    return {
      workLocation: undefined,
      distanceKm: 0,
      durationMins: 0,
      distanceText: '',
      durationText: '',
      rating: 'NOT_SPECIFIED' as const,
      scorePenalty: 0,
      scoreBonus: 0,
      summary: 'Investment Asset: Personal commute distance is exempt.',
      monthlyTravelCostEst: 0,
      annualCommuteHours: 0,
      suggestions: ['Investment assets are evaluated based on capital appreciation velocity, rental yield potential, and micro-market growth corridors rather than daily personal commute.'],
    };
  }

  const workLocation = input.workLocation || input.details?.workLocation;
  if (!workLocation || workLocation.trim() === '') {
    return {
      workLocation: undefined,
      distanceKm: 0,
      durationMins: 0,
      distanceText: '',
      durationText: '',
      rating: 'NOT_SPECIFIED' as const,
      scorePenalty: 0,
      scoreBonus: 0,
      summary: 'Workplace not specified. Commute score neutral.',
      monthlyTravelCostEst: 0,
      annualCommuteHours: 0,
      suggestions: ['Add your workplace to compute transit duration and cost projections.'],
    };
  }

  const workLower = workLocation.toLowerCase();
  const propLocation = (input.location || input.locationDetails?.address || '').toLowerCase();
  
  let distanceKm = 14;
  let durationMins = 35;

  if (workLower.includes('remote') || workLower.includes('wfh') || workLower.includes('home')) {
    distanceKm = 0;
    durationMins = 0;
  } else if (
    (workLower.includes('gurugram') || workLower.includes('cyber city')) && propLocation.includes('noida') ||
    (workLower.includes('noida') && (propLocation.includes('gurugram') || propLocation.includes('gurgaon'))) ||
    (workLower.includes('bengaluru') && !propLocation.includes('bengaluru') && propLocation.length > 3) ||
    (workLower.includes('mumbai') && propLocation.includes('pune')) ||
    workLower.includes('inter-city') || workLower.includes('far')
  ) {
    distanceKm = 44;
    durationMins = 85;
  } else if (workLower.includes('airport') || workLower.includes('outstation') || (workLower.includes('electronic city') && propLocation.includes('whitefield'))) {
    distanceKm = 28;
    durationMins = 65;
  } else if (workLower.length > 2) {
    distanceKm = 16;
    durationMins = 40;
  }

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
    summary = `Optimal Work Commute: ${distanceKm === 0 ? 'Work From Home' : `${distanceKm} km (${durationMins} mins)`} to ${workLocation}.`;
    suggestions.push('Minimal daily travel fatigue saves approx 1.5+ hours every workday.');
    suggestions.push('Accessible via low-cost micro-mobility, bike, or quick public transit.');
  } else if (durationMins <= 45 || distanceKm <= 18) {
    rating = 'MANAGEABLE';
    scoreBonus = 0;
    scorePenalty = -5;
    monthlyTravelCostEst = 5500;
    summary = `Manageable Daily Commute: ${distanceKm} km (${durationMins} mins) to ${workLocation}.`;
    suggestions.push('Standard metro-city commute. Good balance of neighborhood value and accessibility.');
    suggestions.push('Check direct metro feeder bus or carpool options for peak rush hours.');
  } else if (durationMins <= 70 || distanceKm <= 30) {
    rating = 'STRETCHED';
    scoreBonus = 0;
    scorePenalty = -18;
    monthlyTravelCostEst = 9500;
    summary = `Stretched Work Commute: ${distanceKm} km (${durationMins} mins) to ${workLocation}. High travel fatigue.`;
    suggestions.push(`High travel overhead: You will spend ~${annualCommuteHours} hours per year in transit with ~₹${monthlyTravelCostEst.toLocaleString('en-IN')}/mo in fuel/cabs.`);
    suggestions.push('Explore properties along direct express metro corridors or consider hybrid WFH schedules.');
  } else {
    rating = 'EXCESSIVE';
    scoreBonus = 0;
    scorePenalty = -32;
    monthlyTravelCostEst = 14500;
    summary = `⚠️ Excessive Work Commute Warning: Workplace is ${distanceKm} km (${durationMins} mins) away. Severe travel burnout risk.`;
    suggestions.push(`Extreme commute: Daily 2.5+ hours roundtrip (~${annualCommuteHours} hours/yr) and ₹${monthlyTravelCostEst.toLocaleString('en-IN')}/mo recurring travel expense.`);
    suggestions.push('For primary self-use (living), we strongly advise looking within a 15km radius of your workplace or renting closer to your job hub.');
    suggestions.push('If buying purely for investment/rental income, this personal commute penalty can be disregarded.');
  }

  return {
    workLocation,
    distanceKm,
    durationMins,
    distanceText: `${distanceKm} km`,
    durationText: `${durationMins} mins`,
    rating,
    scorePenalty,
    scoreBonus,
    summary,
    monthlyTravelCostEst,
    annualCommuteHours,
    suggestions,
  };
}

export function getRecommendation(scores: AnalysisScores): { recommendation: 'BUY' | 'RENT' | 'WAIT'; confidence: number } {
  if (scores.affordability >= 68 && scores.overall >= 70) {
    return {
      recommendation: 'BUY',
      confidence: Math.min(95, scores.overall),
    };
  }

  if (scores.affordability < 48 && scores.overall < 50) {
    return {
      recommendation: 'RENT',
      confidence: 88,
    };
  }

  return {
    recommendation: 'WAIT',
    confidence: 80,
  };
}
