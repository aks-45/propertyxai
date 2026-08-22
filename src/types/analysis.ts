import { PropertyInput, NearbyPlace, Recommendation } from './property';

export interface AnalysisScores {
  overall: number;
  location: number;
  affordability: number;
  connectivity: number;
  infrastructure: number;
  environment: number;
  future: number;
  buy: number;
  rent: number;
  wait: number;
  [key: string]: number | undefined;
}

export interface CostEstimation {
  propertyPrice: number;
  stampDuty: number;
  registration: number;
  legalCharges: number;
  interiorCost: number;
  totalInitialCost: number;
  monthlyEMI: number;
  monthlyMaintenance: number;
  monthlyTotal: number;
  annualCost: number;
  fiveYearCost: number;
  monthlySalary?: number;
  monthlyExpenses?: number;
  availableIncome?: number;
}

export interface FutureProjection {
  year: number;
  optimistic?: number;
  expected: number;
  conservative?: number;
}

export type RiskLevel = 'low' | 'medium' | 'high';

export interface RiskItem {
  id: string;
  category: string;
  level: RiskLevel;
  title: string;
  description: string;
}

export type BreakDecisionCategory = 'good' | 'warning' | 'risk' | 'assumption' | 'uncertainty';
export type Severity = 'low' | 'medium' | 'high';

export interface BreakDecisionItem {
  id?: string;
  category?: BreakDecisionCategory;
  title?: string;
  description?: string;
  severity?: Severity;
  type?: string;
  factor?: string;
  detail?: string;
  impact?: string;
}

export interface AIExplanation {
  decision_explanation: string;
  top_reasons: string[];
  risks: string[];
  financial_summary?: string;
  what_to_verify?: string[];
  [key: string]: any;
}

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

export interface AnalysisResult {
  id: string;
  propertyId?: string;
  propertyInput: PropertyInput;
  scores: AnalysisScores;
  recommendation: Recommendation;
  confidence: number;
  costEstimation: CostEstimation;
  futureProjections: FutureProjection[];
  risks: RiskItem[];
  breakDecision: BreakDecisionItem[];
  nearbyPlaces: NearbyPlace[];
  reasonsForRecommendation: string[];
  potentialRisks: string[];
  aiExplanation?: AIExplanation;
  commuteAnalysis?: CommuteAnalysis;
  createdAt: string;
}
