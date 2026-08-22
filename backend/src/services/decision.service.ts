import { Scores } from './scoring.service';
import { FinancialMetrics } from './financial.service';
import { LocationIntelligence } from './google/maps.service';

export type DecisionType = 'BUY' | 'RENT' | 'WAIT';

export interface BreakDecisionItem {
  id: string;
  category: 'good' | 'warning' | 'risk' | 'assumption' | 'uncertainty';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface DecisionResult {
  decision: DecisionType;
  confidence: number;
  overallScore: number;
  reasons: string[];
  risks: string[];
  breakDecision: BreakDecisionItem[];
}

export class DecisionService {
  /**
   * Deterministic decision logic synthesizing scores, financial capacity, and data certainty
   */
  async makeDecision(input: {
    scores: Scores;
    financialMetrics: FinancialMetrics;
    locationData: LocationIntelligence;
  }): Promise<DecisionResult> {
    const { scores, financialMetrics, locationData } = input;

    let decision: DecisionType = 'WAIT';
    let baseConfidence = 80;

    // Adjust confidence based on data completeness
    if (financialMetrics.financialConfidence === 'low') {
      baseConfidence -= 25;
    } else if (financialMetrics.financialConfidence === 'medium') {
      baseConfidence -= 10;
    }

    if (financialMetrics.unknownExpenseCategories.length > 0) {
      baseConfidence -= Math.min(15, financialMetrics.unknownExpenseCategories.length * 5);
    }

    // Affordability & Composite Score gating
    const affordability = scores.affordability;
    const overall = scores.overall;

    if (affordability >= 68 && overall >= 70) {
      decision = 'BUY';
    } else if (affordability < 40 || overall < 48) {
      decision = 'RENT';
    } else {
      decision = 'WAIT';
    }

    // High debt burden override
    if (financialMetrics.monthlyIncome && financialMetrics.costEstimation.monthlyEMI) {
      const emiRatio = financialMetrics.costEstimation.monthlyEMI / financialMetrics.monthlyIncome;
      if (emiRatio > 0.55 && decision === 'BUY') {
        decision = 'WAIT';
        baseConfidence = Math.max(50, baseConfidence - 10);
      }
    }

    const confidence = Math.min(95, Math.max(35, Math.round(baseConfidence)));

    // Generate dynamic structured reasons based on exact score
    const reasons = this.generateReasons(decision, scores, financialMetrics, locationData);

    // Generate dynamic risks adapted to score
    const risks = this.generateRisks(decision, scores, financialMetrics, locationData);

    // Generate dynamic break-decision items adapted to score
    const breakDecision = this.generateBreakDecisionItems(decision, scores, financialMetrics, locationData);

    return {
      decision,
      confidence,
      overallScore: overall,
      reasons,
      risks,
      breakDecision,
    };
  }

  private generateReasons(
    decision: DecisionType,
    scores: Scores,
    financial: FinancialMetrics,
    location: LocationIntelligence
  ): string[] {
    const reasons: string[] = [];

    if (decision === 'BUY') {
      reasons.push(`Strong overall intelligence score of ${scores.overall}/100 with high composite fundamentals.`);
      if (scores.affordability >= 65) {
        reasons.push(`Comfortable EMI-to-income ratio (₹${financial.costEstimation.monthlyEMI.toLocaleString('en-IN')}/mo) fits your financial profile.`);
      }
      if (scores.commute && scores.commute.rating === 'EXCELLENT') {
        reasons.push(`Optimal Daily Commute: Just ${scores.commute.distanceText} (${scores.commute.durationText}) to your workplace (${scores.commute.workLocation}).`);
      }
      if (scores.connectivity >= 75) {
        reasons.push('Convenient transport and highway connectivity to key commercial employment zones.');
      }
      if (scores.growth >= 75) {
        reasons.push('High capital appreciation trajectory projected over the 5-year investment horizon.');
      }
    } else if (decision === 'RENT') {
      if (scores.affordability < 40) {
        reasons.push(`Severe affordability constraint: Monthly EMI (₹${financial.costEstimation.monthlyEMI.toLocaleString('en-IN')}) heavily exceeds current surplus capacity.`);
      }
      if (scores.commute && scores.commute.rating === 'EXCESSIVE') {
        reasons.push(`Renting closer to your workplace (${scores.commute.workLocation}) saves over ${scores.commute.annualCommuteHours} hours/year and ₹${scores.commute.monthlyTravelCostEst.toLocaleString('en-IN')}/mo in travel expense.`);
      }
      reasons.push('Renting in this micro-market preserves liquidity while granting complete access to neighborhood amenities.');
      if (scores.rental_potential >= 60) {
        reasons.push('Locality offers healthy rental flexibility without taking on long-term debt liabilities.');
      }
    } else {
      reasons.push(`Moderate overall score (${scores.overall}/100) suggests waiting for better entry pricing or building a larger down payment.`);
      if (scores.commute && (scores.commute.rating === 'EXCESSIVE' || scores.commute.rating === 'STRETCHED')) {
        reasons.push(`Long daily commute (${scores.commute.durationText}) to ${scores.commute.workLocation} reduces quality of life. Explore alternative micro-markets along direct express transit.`);
      }
      if (financial.financialConfidence !== 'high') {
        reasons.push('Unbudgeted living expenses require clarification before locking into a 20-year mortgage.');
      }
      reasons.push('Waiting allows capital accumulation to reduce interest burden upon eventual purchase.');
    }

    return reasons;
  }

  private generateRisks(
    decision: DecisionType,
    scores: Scores,
    financial: FinancialMetrics,
    location: LocationIntelligence
  ): string[] {
    const risks: string[] = [];

    if (scores.affordability <= 25) {
      risks.push(`Critical Financial Risk: Estimated EMI (₹${financial.costEstimation.monthlyEMI.toLocaleString('en-IN')}) and upfront acquisition cost (₹${financial.costEstimation.totalInitialCost.toLocaleString('en-IN')}) severely exceed your savings buffer.`);
    } else if (scores.affordability <= 50) {
      risks.push(`Moderate Debt Burden: Monthly EMI represents a substantial portion of disposable cash flow, reducing emergency liquidity.`);
    }

    if (scores.commute && scores.commute.rating === 'EXCESSIVE') {
      risks.push(`Excessive Commute Penalty: Workplace (${scores.commute.workLocation}) is ${scores.commute.distanceText} (${scores.commute.durationText}) away, accumulating ~${scores.commute.annualCommuteHours} hours/yr in transit and ~₹${scores.commute.monthlyTravelCostEst.toLocaleString('en-IN')}/mo in travel cost.`);
    } else if (scores.commute && scores.commute.rating === 'STRETCHED') {
      risks.push(`Long Travel Time: Daily one-way travel of ${scores.commute.distanceText} (${scores.commute.durationText}) to ${scores.commute.workLocation} adds significant peak-hour fatigue.`);
    }

    if (scores.connectivity < 65) {
      risks.push('Commute Overhead: Limited rapid mass transit access in immediate 3km radius may increase daily travel time.');
    }

    if (location.airQuality && location.airQuality.aqi > 120) {
      risks.push(`Environmental Quality: Local AQI index is ${location.airQuality.aqi} (${location.airQuality.category}), indicating moderate air pollution.`);
    }

    if (scores.growth < 60) {
      risks.push('Subdued Appreciation: Micro-market exhibits slower historical capital appreciation compared to city averages.');
    }

    if (risks.length === 0) {
      risks.push('Interest Rate Volatility: Floating home loan interest rates may rise by 50-100 bps over economic cycles.');
    }

    return risks;
  }

  private generateBreakDecisionItems(
    decision: DecisionType,
    scores: Scores,
    financial: FinancialMetrics,
    location: LocationIntelligence
  ): BreakDecisionItem[] {
    const items: BreakDecisionItem[] = [];

    // 1. DYNAMIC FINANCIAL RISKS BASED ON SCORE
    if (scores.affordability <= 20) {
      items.push({
        id: 'bd_financial_critical',
        category: 'risk',
        title: 'Severe Financial Insolvency Risk',
        description: `Monthly loan EMI of ₹${financial.costEstimation.monthlyEMI.toLocaleString('en-IN')} and upfront outlay of ₹${financial.costEstimation.totalInitialCost.toLocaleString('en-IN')} critically exceed your monthly savings capacity, posing immediate debt default risk.`,
        severity: 'high',
      });
      items.push({
        id: 'bd_downpayment_shortfall',
        category: 'risk',
        title: 'Critical Down Payment Gap',
        description: `Upfront acquisition charges (Down payment + 6% Stamp Duty + Registration = ₹${Math.round(financial.costEstimation.propertyPrice * 0.27).toLocaleString('en-IN')}) cannot be met by your planned timeline savings.`,
        severity: 'high',
      });
    } else if (scores.affordability <= 45) {
      items.push({
        id: 'bd_financial_stretched',
        category: 'warning',
        title: 'Stretched Debt-to-Income Margin',
        description: `Estimated monthly EMI (₹${financial.costEstimation.monthlyEMI.toLocaleString('en-IN')}) absorbs over 45% of available income, leaving minimal cash buffer for unexpected emergencies.`,
        severity: 'medium',
      });
    } else {
      items.push({
        id: 'bd_financial_healthy',
        category: 'good',
        title: 'Comfortable Debt Serviceability',
        description: `Estimated monthly EMI of ₹${financial.costEstimation.monthlyEMI.toLocaleString('en-IN')} is well within safe banking affordability guidelines (<35% of income).`,
        severity: 'low',
      });
    }

    // 2. DYNAMIC LOCATION & CONNECTIVITY / WORK COMMUTE
    if (scores.commute && scores.commute.rating === 'EXCESSIVE') {
      items.push({
        id: 'bd_commute_excessive',
        category: 'risk',
        title: 'Severe Work Commute Burnout Risk',
        description: `Daily one-way travel of ${scores.commute.distanceText} (${scores.commute.durationText}) to ${scores.commute.workLocation} adds ~${scores.commute.annualCommuteHours} hours/yr on the road. We strongly recommend evaluating properties closer to your workplace or renting nearby to avoid chronic travel fatigue.`,
        severity: 'high',
      });
    } else if (scores.commute && scores.commute.rating === 'STRETCHED') {
      items.push({
        id: 'bd_commute_stretched',
        category: 'warning',
        title: 'Stretched Daily Work Commute',
        description: `Commute of ${scores.commute.distanceText} (${scores.commute.durationText}) to ${scores.commute.workLocation} will consume substantial daily time (~${scores.commute.annualCommuteHours} hrs/yr). Consider hybrid work policies or direct express routes.`,
        severity: 'medium',
      });
    } else if (scores.commute && scores.commute.rating === 'EXCELLENT') {
      items.push({
        id: 'bd_commute_excellent',
        category: 'good',
        title: 'Outstanding Work Location Proximity',
        description: `Located just ${scores.commute.distanceText} (${scores.commute.durationText}) from ${scores.commute.workLocation}, saving you ~1.5+ hours of commute time every single working day.`,
        severity: 'low',
      });
    } else if (scores.connectivity >= 75) {
      items.push({
        id: 'bd_conn_high',
        category: 'good',
        title: 'Prime Transit & Highway Reach',
        description: `Direct access to major highways and rapid transit within immediate vicinity ensures high tenant demand and convenience.`,
        severity: 'high',
      });
    } else if (scores.connectivity < 60) {
      items.push({
        id: 'bd_conn_low',
        category: 'warning',
        title: 'Public Transit Accessibility Gap',
        description: `Limited arterial transit connections or long distance to metro/railway stations may increase daily commute costs.`,
        severity: 'medium',
      });
    }

    // 3. DYNAMIC GROWTH & APPRECIATION
    if (scores.growth >= 75) {
      items.push({
        id: 'bd_growth_high',
        category: 'good',
        title: 'High Capital Growth Potential',
        description: `Area is positioned along expanding growth corridors, projected to yield +25% to +35% appreciation over 5 years.`,
        severity: 'medium',
      });
    } else if (scores.growth < 55) {
      items.push({
        id: 'bd_growth_low',
        category: 'warning',
        title: 'Sluggish Capital Appreciation',
        description: `Subdued local infrastructure expansion may result in below-inflation capital appreciation.`,
        severity: 'medium',
      });
    }

    // 4. UNBUDGETED / UNKNOWN EXPENSES
    if (financial.unknownExpenseCategories.length > 0) {
      items.push({
        id: 'bd_unknown_costs',
        category: 'uncertainty',
        title: 'Unbudgeted Household Outflows',
        description: `Living expenditures for ${financial.unknownExpenseCategories.join(', ')} were marked as unknown; actual surplus could be lower.`,
        severity: 'medium',
      });
    }

    // 5. INTEREST RATE / MACRO RISK
    items.push({
      id: 'bd_interest_macro',
      category: scores.overall < 50 ? 'risk' : 'assumption',
      title: 'Floating Home Loan Rate Sensitivity',
      description: 'A 100 bps (1%) hike in RBI benchmark lending rate would increase monthly EMI by ~₹' + Math.round(financial.costEstimation.monthlyEMI * 0.07).toLocaleString('en-IN') + '/mo.',
      severity: scores.overall < 50 ? 'high' : 'low',
    });

    return items;
  }
}