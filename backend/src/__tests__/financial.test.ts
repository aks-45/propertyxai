import { test, describe } from 'node:test';
import assert from 'node:assert';
import { FinancialService } from '../services/financial.service';

describe('Financial Engine Tests', () => {
  const financialService = new FinancialService();

  test('EMI calculation returns accurate monthly installment', () => {
    // Principal 4,000,000, 8.5% interest, 20 years
    const emi = financialService.calculateEMI(4000000, 8.5, 20);
    assert.strictEqual(typeof emi, 'number');
    assert.ok(emi > 30000 && emi < 40000, `Expected EMI between 30k and 40k, got ${emi}`);
  });

  test('Preserves 3-state expenditure distinction and never converts unknown to 0', async () => {
    const metrics = await financialService.calculateFinancialMetrics({
      monthlyIncome: 120000,
      expenditures: {
        commute: { status: 'amount', amount: 5000 },
        healthcare: { status: 'unknown', amount: undefined },
        education: { status: 'none', amount: 0 },
        groceries: { status: 'amount', amount: 15000 },
      },
      savings: {
        stocks_mutual_funds: { status: 'amount', amount: 10000 },
        gold: { status: 'unknown', amount: undefined },
      },
      propertyPrice: 5000000,
    });

    // Known expenses must only be commute (5000) + groceries (15000) = 20000
    assert.strictEqual(metrics.knownExpenses, 20000);
    // Healthcare must be captured in unknownExpenseCategories
    assert.ok(metrics.unknownExpenseCategories.includes('healthcare'));
    // Education must be captured in noneExpenseCategories
    assert.ok(metrics.noneExpenseCategories.includes('education'));
    // Financial confidence must reflect uncertainty (medium or low, not high)
    assert.ok(metrics.financialConfidence === 'medium' || metrics.financialConfidence === 'low');
  });

  test('High debt-to-income triggers risk flag', async () => {
    const metrics = await financialService.calculateFinancialMetrics({
      monthlyIncome: 40000,
      expenditures: {
        commute: { status: 'amount', amount: 5000 },
      },
      propertyPrice: 10000000, // 1 Crore -> EMI ~ 70k, Monthly Income 40k
    });

    const highEmiRisk = metrics.risks.find(r => r.id === 'risk_emi_high');
    assert.ok(highEmiRisk !== undefined, 'Expected high EMI risk flag');
    assert.strictEqual(highEmiRisk?.level, 'high');
  });

  test('Calculates complete 5-year cost projection and true acquisition costs', async () => {
    const metrics = await financialService.calculateFinancialMetrics({
      monthlyIncome: 150000,
      propertyPrice: 6000000,
    });

    assert.strictEqual(metrics.costEstimation.stampDuty, 360000); // 6%
    assert.strictEqual(metrics.costEstimation.registration, 60000); // 1%
    assert.strictEqual(metrics.costEstimation.legalCharges, 25000);
    assert.strictEqual(metrics.costEstimation.interiorCost, 600000); // 10%
    assert.strictEqual(metrics.costEstimation.totalInitialCost, 7045000);

    assert.strictEqual(metrics.futureProjections.length, 5);
    assert.ok(metrics.futureProjections[4].expected > metrics.costEstimation.propertyPrice);
  });

  test('Affords 43 Lakh property with 93k monthly savings giving strong BUY recommendation', async () => {
    const { ScoringService } = await import('../services/scoring.service');
    const scoringService = new ScoringService();

    const metrics = await financialService.calculateFinancialMetrics({
      monthlyIncome: 140000,
      monthlyExpenses: 47000,
      availableIncome: 93000,
      propertyPrice: 4300000,
    });

    const scores = await scoringService.calculateScores({
      property: {
        price: 4300000,
        area: 1100,
        monthlySalary: 140000,
        monthlyExpenses: 47000,
        availableIncome: 93000,
        purpose: 'live',
      },
      locationData: {
        lat: 28.5,
        lng: 77.3,
        address: 'Noida',
        city: 'Noida',
        state: 'Uttar Pradesh',
        nearbyPlaces: [
          { name: 'Hospital', type: 'hospital', distance: '1km', distanceKm: 1, icon: '' },
          { name: 'School', type: 'school', distance: '1km', distanceKm: 1, icon: '' },
        ],
        routes: { transitAccess: true, highwayAccess: true },
      },
      financialMetrics: metrics,
    });

    assert.ok(scores.affordability >= 80, `Expected affordability score >= 80, got ${scores.affordability}`);
    assert.ok(scores.overall >= 78, `Expected overall score >= 78, got ${scores.overall}`);
    assert.ok(scores.buy > scores.rent, 'Expected BUY score to exceed RENT score');
  });

  test('Produces WAIT recommendation for 75 Lakh property with 48k monthly savings', async () => {
    const { ScoringService } = await import('../services/scoring.service');
    const { DecisionService } = await import('../services/decision.service');
    const scoringService = new ScoringService();
    const decisionService = new DecisionService();

    const metrics = await financialService.calculateFinancialMetrics({
      monthlyIncome: 100000,
      monthlyExpenses: 52000,
      availableIncome: 48000,
      propertyPrice: 7500000,
    });

    const locationData = {
      lat: 28.5,
      lng: 77.3,
      address: 'Sector 150, Noida',
      city: 'Noida',
      state: 'Uttar Pradesh',
      nearbyPlaces: [
        { name: 'Hospital', type: 'hospital', distance: '1.5km', distanceKm: 1.5, icon: '' },
        { name: 'School', type: 'school', distance: '1.2km', distanceKm: 1.2, icon: '' },
      ],
      routes: {
        transitAccess: true,
        highwayAccess: true,
        workplace: {
          destination: 'Cyber City, Gurugram',
          distance: '24 km',
          duration: '45 mins',
          distanceValue: 24000,
          durationValue: 2700,
        },
      },
    };

    const scores = await scoringService.calculateScores({
      property: {
        price: 7500000,
        area: 1400,
        monthlySalary: 100000,
        monthlyExpenses: 52000,
        availableIncome: 48000,
        purpose: 'live',
        moveTimeline: 'within-6-months',
      },
      locationData,
      financialMetrics: metrics,
    });

    const decisionResult = await decisionService.makeDecision({
      scores,
      financialMetrics: metrics,
      locationData,
    });

    assert.ok(scores.overall >= 50, `Expected overall score >= 50, got ${scores.overall}`);
    assert.strictEqual(decisionResult.decision, 'WAIT', `Expected WAIT decision, got ${decisionResult.decision}`);
  });
});
