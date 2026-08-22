export type FinancialFieldStatus = 'amount' | 'unknown' | 'none';

export interface FinancialItem {
  status: FinancialFieldStatus;
  amount?: number;
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
  optimistic: number;
  expected: number;
  conservative: number;
}

export interface FinancialRiskItem {
  id: string;
  category: string;
  level: 'low' | 'medium' | 'high';
  title: string;
  description: string;
}

export interface FinancialMetrics {
  monthlyIncome: number | null;
  monthlyExpenses: number | null;
  availableIncome: number | null;
  knownExpenses: number;
  unknownExpenseCategories: string[];
  noneExpenseCategories: string[];
  knownSavings: number;
  unknownSavingsCategories: string[];
  existingEmi: number;
  estimatedPropertyCapacity: number;
  financialConfidence: 'high' | 'medium' | 'low';
  costEstimation: CostEstimation;
  futureProjections: FutureProjection[];
  risks: FinancialRiskItem[];
}

export class FinancialService {
  /**
   * Calculate standard loan EMI using standard reducing balance formula
   * @param principal Principal loan amount
   * @param annualInterestRate Annual interest rate in percent (e.g. 8.5)
   * @param tenureYears Loan tenure in years (e.g. 20)
   */
  calculateEMI(principal: number, annualInterestRate: number = 8.5, tenureYears: number = 20): number {
    if (principal <= 0) return 0;
    const monthlyRate = annualInterestRate / 12 / 100;
    const numberOfMonths = tenureYears * 12;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfMonths)) / (Math.pow(1 + monthlyRate, numberOfMonths) - 1);
    return Math.round(emi);
  }

  /**
   * Deterministic calculation of complete financial metrics
   */
  async calculateFinancialMetrics(input: {
    monthlyIncome?: number;
    monthlyExpenses?: number;
    availableIncome?: number;
    expenditures?: Record<string, FinancialItem>;
    savings?: Record<string, FinancialItem>;
    propertyPrice: number;
    propertyType?: string;
    paymentMode?: string;
  }): Promise<FinancialMetrics> {
    const expenditures = input.expenditures || {};
    const savings = input.savings || {};
    const propertyPrice = Number(input.propertyPrice) || 0;
    const isFullPayment = input.paymentMode === 'full';

    // 1. Calculate known expenditures
    let knownExpenses = 0;
    const unknownExpenseCategories: string[] = [];
    const noneExpenseCategories: string[] = [];
    let existingEmi = 0;

    for (const [category, item] of Object.entries(expenditures)) {
      if (item.status === 'amount' && typeof item.amount === 'number' && item.amount >= 0) {
        if (category === 'existing_emi') {
          existingEmi = item.amount;
        } else {
          knownExpenses += item.amount;
        }
      } else if (item.status === 'unknown') {
        unknownExpenseCategories.push(category);
      } else if (item.status === 'none') {
        noneExpenseCategories.push(category);
      }
    }

    // If explicit monthlyExpenses was supplied and exceeds categorized known expenses, use it
    let totalMonthlyExpenses = knownExpenses + existingEmi;
    if (input.monthlyExpenses !== undefined && input.monthlyExpenses > totalMonthlyExpenses) {
      totalMonthlyExpenses = input.monthlyExpenses;
    }

    // 2. Calculate known savings / liquid investments
    let knownSavings = 0;
    const unknownSavingsCategories: string[] = [];

    for (const [category, item] of Object.entries(savings)) {
      if (item.status === 'amount' && typeof item.amount === 'number' && item.amount >= 0) {
        knownSavings += item.amount;
      } else if (item.status === 'unknown') {
        unknownSavingsCategories.push(category);
      }
    }

    // 3. Calculate Monthly Income & Available Income
    let monthlyIncome: number | null = null;
    if (input.monthlyIncome !== undefined && input.monthlyIncome > 0) {
      monthlyIncome = input.monthlyIncome;
    }

    let availableIncome: number | null = null;
    if (input.availableIncome !== undefined) {
      availableIncome = input.availableIncome;
    } else if (monthlyIncome !== null) {
      availableIncome = Math.max(0, monthlyIncome - totalMonthlyExpenses);
    }

    // 4. Determine Financial Confidence (CRITICAL: unknown values decrease confidence)
    let financialConfidence: 'high' | 'medium' | 'low' = 'high';
    if (isFullPayment) {
      financialConfidence = 'high';
    } else if (monthlyIncome === null || unknownExpenseCategories.length >= 3) {
      financialConfidence = 'low';
    } else if (unknownExpenseCategories.length >= 1 || unknownSavingsCategories.length >= 2) {
      financialConfidence = 'medium';
    }

    // 5. Estimated Property Capacity (Monthly EMI buffer)
    const estimatedPropertyCapacity = availableIncome !== null ? Math.max(0, availableIncome) : 0;

    // 6. True Cost Estimation Breakdown
    const stampDuty = Math.round(propertyPrice * 0.06); // Standard 6%
    const registration = Math.round(propertyPrice * 0.01); // 1%
    const legalCharges = 25000; // Standard flat legal/due diligence charges in India
    const isLand = input.propertyType === 'land' || input.propertyType === 'residential_land' || input.propertyType === 'agricultural_land';
    const interiorCost = isLand ? 0 : Math.round(propertyPrice * 0.10); // 10% for furnished/finishing
    const totalInitialCost = propertyPrice + stampDuty + registration + legalCharges + interiorCost;

    const loanPrincipal = isFullPayment ? 0 : propertyPrice * 0.80; // Zero loan for full upfront payment
    const monthlyEMI = isFullPayment ? 0 : this.calculateEMI(loanPrincipal, 8.5, 20);
    const monthlyMaintenance = isLand ? 0 : (propertyPrice > 10000000 ? 7500 : 4500);
    const monthlyTotal = monthlyEMI + monthlyMaintenance;
    const annualCost = monthlyTotal * 12 + Math.round(propertyPrice * 0.005); // Maintenance + property tax
    const fiveYearCost = annualCost * 5;

    const costEstimation: CostEstimation = {
      propertyPrice,
      stampDuty,
      registration,
      legalCharges,
      interiorCost,
      totalInitialCost,
      monthlyEMI,
      monthlyMaintenance,
      monthlyTotal,
      annualCost,
      fiveYearCost,
      monthlySalary: monthlyIncome || undefined,
      monthlyExpenses: totalMonthlyExpenses || undefined,
      availableIncome: availableIncome || undefined,
    };

    // 7. Future 5-year appreciation projections
    const currentYear = new Date().getFullYear();
    const futureProjections: FutureProjection[] = [
      { year: currentYear, optimistic: propertyPrice, expected: propertyPrice, conservative: propertyPrice },
      { year: currentYear + 1, optimistic: Math.round(propertyPrice * 1.10), expected: Math.round(propertyPrice * 1.06), conservative: Math.round(propertyPrice * 1.03) },
      { year: currentYear + 2, optimistic: Math.round(propertyPrice * 1.22), expected: Math.round(propertyPrice * 1.12), conservative: Math.round(propertyPrice * 1.06) },
      { year: currentYear + 3, optimistic: Math.round(propertyPrice * 1.35), expected: Math.round(propertyPrice * 1.19), conservative: Math.round(propertyPrice * 1.09) },
      { year: currentYear + 4, optimistic: Math.round(propertyPrice * 1.50), expected: Math.round(propertyPrice * 1.27), conservative: Math.round(propertyPrice * 1.12) },
    ];

    // 8. Financial Risk Assessment
    const risks: FinancialRiskItem[] = [];

    // Check EMI-to-Income / Capacity ratio
    if (monthlyIncome !== null && monthlyIncome > 0) {
      const emiToIncomeRatio = monthlyEMI / monthlyIncome;
      if (emiToIncomeRatio > 0.50) {
        risks.push({
          id: 'risk_emi_high',
          category: 'Financial',
          level: 'high',
          title: 'High EMI-to-Income Burden',
          description: `The estimated monthly EMI (₹${monthlyEMI.toLocaleString('en-IN')}) consumes ${(emiToIncomeRatio * 100).toFixed(0)}% of monthly salary (above safe 40% limit).`,
        });
      } else if (emiToIncomeRatio > 0.40) {
        risks.push({
          id: 'risk_emi_moderate',
          category: 'Financial',
          level: 'medium',
          title: 'Moderate Debt-to-Income',
          description: `Estimated EMI represents ${(emiToIncomeRatio * 100).toFixed(0)}% of monthly income. Ensure adequate emergency buffer.`,
        });
      }
    }

    if (unknownExpenseCategories.length > 0) {
      risks.push({
        id: 'risk_unknown_expenses',
        category: 'Financial',
        level: 'medium',
        title: 'Unbudgeted Expenditures',
        description: `Expenditures for ${unknownExpenseCategories.join(', ')} were marked as unknown. Actual affordability might be lower.`,
      });
    }

    risks.push({
      id: 'risk_interest_rate',
      category: 'Market',
      level: 'low',
      title: 'Floating Interest Rate Exposure',
      description: 'Home loan interest rates fluctuate with RBI repo rates over a 20-year horizon.',
    });

    return {
      monthlyIncome,
      monthlyExpenses: totalMonthlyExpenses,
      availableIncome,
      knownExpenses,
      unknownExpenseCategories,
      noneExpenseCategories,
      knownSavings,
      unknownSavingsCategories,
      existingEmi,
      estimatedPropertyCapacity,
      financialConfidence,
      costEstimation,
      futureProjections,
      risks,
    };
  }
}