import { test, describe } from 'node:test';
import assert from 'node:assert';
import { DecisionService } from '../services/decision.service';
import { Scores } from '../services/scoring.service';
import { FinancialMetrics } from '../services/financial.service';
import { LocationIntelligence } from '../services/google/maps.service';

describe('Decision Engine Tests', () => {
  const decisionService = new DecisionService();

  const mockLocation: LocationIntelligence = {
    lat: 28.5355,
    lng: 77.3910,
    address: 'Sector 62, Noida, Uttar Pradesh',
    city: 'Noida',
    state: 'Uttar Pradesh',
    nearbyPlaces: [
      { name: 'City Hospital', type: 'Hospital', distance: '1.2 km', distanceKm: 1.2, icon: 'hospital' },
      { name: 'DPS School', type: 'School', distance: '1.5 km', distanceKm: 1.5, icon: 'school' },
    ],
    routes: {
      transitAccess: true,
      highwayAccess: true,
    },
  };

  test('Recommends BUY when affordability and overall score are high', async () => {
    const mockScores: Scores = {
      overall: 84,
      location: 82,
      affordability: 80,
      connectivity: 85,
      infrastructure: 80,
      healthcare: 85,
      education: 85,
      daily_convenience: 80,
      environment: 75,
      rental_potential: 78,
      growth: 82,
      future: 80,
      buy: 88,
      rent: 40,
      wait: 30,
    };

    const mockFinancial: FinancialMetrics = {
      monthlyIncome: 200000,
      monthlyExpenses: 50000,
      availableIncome: 150000,
      knownExpenses: 50000,
      unknownExpenseCategories: [],
      noneExpenseCategories: [],
      knownSavings: 2000000,
      unknownSavingsCategories: [],
      existingEmi: 0,
      estimatedPropertyCapacity: 150000,
      financialConfidence: 'high',
      costEstimation: {
        propertyPrice: 6000000,
        stampDuty: 360000,
        registration: 60000,
        legalCharges: 25000,
        interiorCost: 600000,
        totalInitialCost: 7045000,
        monthlyEMI: 41655,
        monthlyMaintenance: 4500,
        monthlyTotal: 46155,
        annualCost: 583860,
        fiveYearCost: 2919300,
      },
      futureProjections: [],
      risks: [],
    };

    const result = await decisionService.makeDecision({
      scores: mockScores,
      financialMetrics: mockFinancial,
      locationData: mockLocation,
    });

    assert.strictEqual(result.decision, 'BUY');
    assert.ok(result.confidence >= 70);
    assert.ok(result.reasons.length > 0);
    assert.ok(result.breakDecision.length > 0);
  });

  test('Recommends RENT when affordability is low', async () => {
    const mockScores: Scores = {
      overall: 58,
      location: 70,
      affordability: 35,
      connectivity: 65,
      infrastructure: 60,
      healthcare: 60,
      education: 60,
      daily_convenience: 65,
      environment: 50,
      rental_potential: 70,
      growth: 60,
      future: 65,
      buy: 35,
      rent: 85,
      wait: 40,
    };

    const mockFinancial: FinancialMetrics = {
      monthlyIncome: 60000,
      monthlyExpenses: 40000,
      availableIncome: 20000,
      knownExpenses: 40000,
      unknownExpenseCategories: ['healthcare', 'insurance'],
      noneExpenseCategories: [],
      knownSavings: 100000,
      unknownSavingsCategories: [],
      existingEmi: 0,
      estimatedPropertyCapacity: 20000,
      financialConfidence: 'low',
      costEstimation: {
        propertyPrice: 12000000,
        stampDuty: 720000,
        registration: 120000,
        legalCharges: 25000,
        interiorCost: 1200000,
        totalInitialCost: 14065000,
        monthlyEMI: 83310,
        monthlyMaintenance: 7500,
        monthlyTotal: 90810,
        annualCost: 1149720,
        fiveYearCost: 5748600,
      },
      futureProjections: [],
      risks: [],
    };

    const result = await decisionService.makeDecision({
      scores: mockScores,
      financialMetrics: mockFinancial,
      locationData: mockLocation,
    });

    assert.strictEqual(result.decision, 'RENT');
  });

  test('Descores connectivity and flags excessive commute when workplace is far', async () => {
    const { ScoringService } = await import('../services/scoring.service');
    const scoringService = new ScoringService();

    const farLocation: LocationIntelligence = {
      ...mockLocation,
      routes: {
        transitAccess: true,
        highwayAccess: true,
        workplace: {
          destination: 'Cyber City, Gurugram',
          distance: '45.0 km',
          distanceValue: 45000,
          duration: '85 mins',
          durationValue: 5100,
        },
      },
    };

    const mockFinancial: FinancialMetrics = {
      monthlyIncome: 200000,
      monthlyExpenses: 50000,
      availableIncome: 150000,
      knownExpenses: 50000,
      unknownExpenseCategories: [],
      noneExpenseCategories: [],
      knownSavings: 2000000,
      unknownSavingsCategories: [],
      existingEmi: 0,
      estimatedPropertyCapacity: 150000,
      financialConfidence: 'high',
      costEstimation: {
        propertyPrice: 6000000,
        stampDuty: 360000,
        registration: 60000,
        legalCharges: 25000,
        interiorCost: 600000,
        totalInitialCost: 7045000,
        monthlyEMI: 41655,
        monthlyMaintenance: 4500,
        monthlyTotal: 46155,
        annualCost: 583860,
        fiveYearCost: 2919300,
      },
      futureProjections: [],
      risks: [],
    };

    const scores = await scoringService.calculateScores({
      property: {
        price: 6000000,
        area: 1200,
        purpose: 'live',
      },
      locationData: farLocation,
      financialMetrics: mockFinancial,
    });

    assert.ok(scores.commute);
    assert.strictEqual(scores.commute.rating, 'EXCESSIVE');
    assert.strictEqual(scores.commute.scorePenalty, -32);
    assert.ok(scores.connectivity < 65, 'Connectivity score should be significantly descored');
    assert.ok(scores.commute.suggestions.length > 0, 'Should provide actionable commute suggestions');

    const decisionResult = await decisionService.makeDecision({
      scores,
      financialMetrics: mockFinancial,
      locationData: farLocation,
    });

    assert.ok(decisionResult.risks.some(r => r.toLowerCase().includes('commute')), 'Should include commute risk');
    assert.ok(decisionResult.breakDecision.some(b => b.id === 'bd_commute_excessive'), 'Should include excessive commute break-decision item');
  });
});
