import { AnalysisResult, BreakDecisionItem, CostEstimation, FutureProjection, RiskItem } from '../types/analysis';
import { PropertyInput, NearbyPlace } from '../types/property';
import { calculatePropertyScore, getRecommendation } from '../lib/scoring';
import { calculateEMI } from '../lib/calculations';

export function generateMockAnalysis(input: PropertyInput): AnalysisResult {
  const scores = calculatePropertyScore(input);
  const recData = getRecommendation(scores);
  
  const propertyPrice = input.price;
  const stampDuty = propertyPrice * 0.06;
  const registration = propertyPrice * 0.01;
  const legalCharges = 25000;
  const interiorCost = propertyPrice * 0.1;
  const totalInitialCost = propertyPrice + stampDuty + registration + legalCharges + interiorCost;
  
  const loanAmount = propertyPrice * 0.8;
  const monthlyEMI = calculateEMI(loanAmount, 8.5, 20);
  const monthlyMaintenance = input.type === 'land' ? 0 : 5000;
  const monthlyTotal = monthlyEMI + monthlyMaintenance;
  
  const annualCost = monthlyTotal * 12 + (propertyPrice * 0.005);
  const fiveYearCost = annualCost * 5;

  const costEstimation: CostEstimation = {
    propertyPrice, stampDuty, registration, legalCharges, interiorCost, totalInitialCost, monthlyEMI, monthlyMaintenance, monthlyTotal, annualCost, fiveYearCost
  };

  const futureProjections: FutureProjection[] = [
    { year: 2024, optimistic: propertyPrice, expected: propertyPrice, conservative: propertyPrice },
    { year: 2025, optimistic: propertyPrice * 1.08, expected: propertyPrice * 1.05, conservative: propertyPrice * 1.02 },
    { year: 2026, optimistic: propertyPrice * 1.16, expected: propertyPrice * 1.10, conservative: propertyPrice * 1.04 },
    { year: 2027, optimistic: propertyPrice * 1.25, expected: propertyPrice * 1.16, conservative: propertyPrice * 1.06 },
    { year: 2028, optimistic: propertyPrice * 1.35, expected: propertyPrice * 1.22, conservative: propertyPrice * 1.08 }
  ];

  const risks: RiskItem[] = [
    { id: 'r1', category: 'Legal', level: 'low', title: 'Clear Title', description: 'Property title is verified and clear.' },
    { id: 'r2', category: 'Market', level: 'medium', title: 'Oversupply', description: 'Similar properties are emerging in the vicinity.' },
    { id: 'r3', category: 'Construction', level: 'low', title: 'Reputed Builder', description: 'Builder has a good track record.' },
    { id: 'r4', category: 'Environment', level: 'low', title: 'No Flood Zone', description: 'Area has adequate drainage systems.' },
    { id: 'r5', category: 'Financial', level: 'medium', title: 'Interest Rates', description: 'Home loan interest rates might increase.' }
  ];

  const breakDecision: BreakDecisionItem[] = [
    { id: 'bd1', category: 'good', title: 'Excellent Connectivity', description: 'Close to major highways and metro stations.', severity: 'high' },
    { id: 'bd2', category: 'good', title: 'Appreciation Potential', description: 'Upcoming IT park within 5km radius.', severity: 'medium' },
    { id: 'bd3', category: 'warning', title: 'High Maintenance', description: 'Monthly maintenance is above average for the area.', severity: 'medium' },
    { id: 'bd4', category: 'risk', title: 'Traffic Congestion', description: 'Peak hour traffic can be severe in this locality.', severity: 'high' },
    { id: 'bd5', category: 'assumption', title: 'Stable Job Market', description: 'Assuming the local IT sector continues to grow.', severity: 'low' },
    { id: 'bd6', category: 'uncertainty', title: 'Policy Changes', description: 'Potential changes in local zoning laws.', severity: 'medium' }
  ];

  const nearbyPlaces: NearbyPlace[] = [
    { name: 'Delhi Public School', type: 'School', distance: '1.2 km', distanceKm: 1.2, icon: 'school' },
    { name: 'City Hospital', type: 'Hospital', distance: '1.8 km', distanceKm: 1.8, icon: 'hospital' },
    { name: 'Central Metro Station', type: 'Metro', distance: '2.1 km', distanceKm: 2.1, icon: 'train' },
    { name: 'Local Market', type: 'Market', distance: '0.8 km', distanceKm: 0.8, icon: 'shopping-cart' },
    { name: 'International Airport', type: 'Airport', distance: '25 km', distanceKm: 25, icon: 'plane' },
    { name: 'Apollo Pharmacy', type: 'Pharmacy', distance: '0.5 km', distanceKm: 0.5, icon: 'pill' },
    { name: 'HDFC Bank', type: 'Bank', distance: '1.0 km', distanceKm: 1.0, icon: 'building' },
    { name: 'Indian Oil', type: 'Petrol Pump', distance: '0.7 km', distanceKm: 0.7, icon: 'fuel' }
  ];

  return {
    id: `an_${Date.now()}`,
    propertyInput: input,
    scores,
    recommendation: recData.recommendation,
    confidence: recData.confidence,
    costEstimation,
    futureProjections,
    risks,
    breakDecision,
    nearbyPlaces,
    reasonsForRecommendation: [
      'Strong historical price appreciation in this area.',
      'Excellent connectivity to major employment hubs.',
      'Well-developed social infrastructure nearby.'
    ],
    potentialRisks: [
      'Upcoming supply might affect rental yields.',
      'Traffic congestion during peak hours.'
    ],
    createdAt: new Date().toISOString()
  };
}
