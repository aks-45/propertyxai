import { AnalysisScores } from '../types/analysis';
import { PropertyInput } from '../types/property';

export function calculatePropertyScore(input: PropertyInput): AnalysisScores {
  const priceWeight = Math.min(100, Math.max(0, 100 - (input.price / 1000000)));
  const areaWeight = Math.min(100, (input.area / 1000) * 50);
  
  const overall = Math.round((priceWeight + areaWeight + 160) / 3);
  
  return {
    overall: overall,
    location: Math.min(100, overall + 5),
    affordability: Math.round(priceWeight),
    connectivity: 85,
    infrastructure: 78,
    environment: 75,
    future: 82,
    buy: overall > 75 ? 85 : 45,
    rent: overall <= 75 ? 80 : 50,
    wait: overall > 60 && overall < 75 ? 75 : 30
  };
}

export function getRecommendation(scores: AnalysisScores): { recommendation: 'BUY' | 'RENT' | 'WAIT', confidence: number } {
  const max = Math.max(scores.buy, scores.rent, scores.wait);
  let rec: 'BUY' | 'RENT' | 'WAIT' = 'WAIT';
  
  if (max === scores.buy) rec = 'BUY';
  else if (max === scores.rent) rec = 'RENT';
  
  return {
    recommendation: rec,
    confidence: max
  };
}
