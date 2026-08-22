export function formatINR(amount: number): string {
  if (amount >= 10000000) {
    const cr = amount / 10000000;
    return `₹${Number.isInteger(cr) ? cr : cr.toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    const lk = amount / 100000;
    return `₹${Number.isInteger(lk) ? lk : lk.toFixed(2)} Lakh`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatCompactINR(amount: number): string {
  if (amount >= 10000000) {
    const cr = amount / 10000000;
    return `₹${Number.isInteger(cr) ? cr : cr.toFixed(1)}Cr`;
  }
  if (amount >= 100000) {
    const lk = amount / 100000;
    return `₹${Number.isInteger(lk) ? lk : lk.toFixed(1)}L`;
  }
  return formatINR(amount);
}

export function calculateEMI(principal: number, rate: number, years: number): number {
  if (principal <= 0 || rate <= 0 || years <= 0) return 0;
  const r = rate / 12 / 100;
  const n = years * 12;
  const emi = principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  return Math.round(emi);
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Very Good';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Average';
  if (score >= 50) return 'Below Average';
  return 'Poor';
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

export function getRecommendationColor(rec: string): string {
  switch (rec) {
    case 'BUY': return 'text-green-600 bg-green-50';
    case 'RENT': return 'text-blue-600 bg-blue-50';
    case 'WAIT': return 'text-yellow-600 bg-yellow-50';
    default: return 'text-gray-600 bg-gray-50';
  }
}

export function getScoreDescription(score: number, rec?: string): string {
  if (score >= 85) {
    return 'Outstanding investment potential with exceptional financial affordability and strong capital growth outlook.';
  }
  if (score >= 75) {
    return 'This property has strong potential with healthy projected returns and comfortable financial feasibility.';
  }
  if (score >= 65) {
    return 'Decent investment with balanced fundamentals, though careful negotiation on price and loan terms is advised.';
  }
  if (score >= 50) {
    return 'Moderate potential. Stretched financial commitments or pending infrastructure suggest waiting for better entry terms.';
  }
  if (score >= 35) {
    return 'High financial strain or sub-par growth indicators. Renting or exploring alternative localities is strongly recommended.';
  }
  return 'Critical financial insolvency risk or severe acquisition shortfall. Purchasing under current terms poses high debt risk.';
}

