import { test, describe } from 'node:test';
import assert from 'node:assert';
import { GovernmentService } from '../services/government/service';

describe('Government Guidance Service Tests', () => {
  const govService = new GovernmentService();

  test('Returns accurate state portals and stamp duty information for Uttar Pradesh', async () => {
    const guide = await govService.getGovernmentGuide({
      buyerState: 'UP',
      propertyState: 'UP',
      buyerStatus: 'Indian Citizen',
      propertyCity: 'Lucknow',
      propertyAddress: 'Gomti Nagar, Lucknow',
      propertyType: 'flat',
      purchasePurpose: 'live',
    });

    assert.strictEqual(guide.scenario.isInterstate, false);
    assert.ok(guide.stateRules.stateName.toLowerCase().includes('uttar pradesh'));
    assert.ok(guide.checklist.length > 0);
    assert.ok(guide.timeline.length > 0);
    assert.ok(guide.officialPortals.length > 0);
  });

  test('Flags interstate purchase when buyer state differs from property state', async () => {
    const guide = await govService.getGovernmentGuide({
      buyerState: 'DL',
      propertyState: 'KA',
      buyerStatus: 'Indian Citizen',
      propertyCity: 'Bengaluru',
      propertyAddress: 'Whitefield, Bengaluru',
      propertyType: 'apartment',
      purchasePurpose: 'investment',
    });

    assert.strictEqual(guide.scenario.isInterstate, true);
    assert.ok(guide.scenario.interstateMessage !== undefined);
  });

  test('Flags strict outsider prohibition in Sikkim (Article 371F)', async () => {
    const guide = await govService.getGovernmentGuide({
      buyerState: 'Delhi',
      propertyState: 'Sikkim',
      buyerStatus: 'Indian Citizen',
      propertyCity: 'Gangtok',
      propertyAddress: 'MG Marg, Gangtok, Sikkim',
      propertyType: 'flat',
      purchasePurpose: 'live',
    });

    assert.ok(guide.stateRules.stateName.toLowerCase().includes('sikkim'));
    assert.ok(guide.stateRules.interstateNotice?.includes('OUTSIDER PURCHASE BARRED') || guide.stateRules.interstateNotice?.includes('Article 371F'));
    assert.ok(guide.stateRules.agriculturalLandWarning?.includes('Article 371F'));
  });

  test('Provides correct municipal flat buying rules for Himachal Pradesh and Uttarakhand', async () => {
    const hpGuide = await govService.getGovernmentGuide({
      buyerState: 'Delhi',
      propertyState: 'Himachal Pradesh',
      buyerStatus: 'Indian Citizen',
      propertyCity: 'Shimla',
      propertyAddress: 'Mall Road, Shimla, HP',
      propertyType: 'flat',
      purchasePurpose: 'live',
    });

    assert.ok(hpGuide.stateRules.stateName.toLowerCase().includes('himachal'));
    assert.ok(hpGuide.stateRules.agriculturalLandWarning?.includes('Section 118'));

    const ukGuide = await govService.getGovernmentGuide({
      buyerState: 'Delhi',
      propertyState: 'Uttarakhand',
      buyerStatus: 'Indian Citizen',
      propertyCity: 'Dehradun',
      propertyAddress: 'Rajpur Road, Dehradun, UK',
      propertyType: 'flat',
      purchasePurpose: 'live',
    });

    assert.ok(ukGuide.stateRules.stateName.toLowerCase().includes('uttarakhand'));
    assert.ok(ukGuide.stateRules.interstateNotice?.includes('municipal') || ukGuide.stateRules.agriculturalLandWarning?.includes('250 sq. meters'));
  });

  test('Flags zonal/hill restrictions for Manipur (Article 371C)', async () => {
    const guide = await govService.getGovernmentGuide({
      buyerState: 'Delhi',
      propertyState: 'Manipur',
      buyerStatus: 'Indian Citizen',
      propertyCity: 'Imphal',
      propertyAddress: 'Thangal Bazar, Imphal, Manipur',
      propertyType: 'flat',
      purchasePurpose: 'live',
    });

    assert.ok(guide.stateRules.stateName.toLowerCase().includes('manipur'));
    assert.ok(guide.stateRules.interstateNotice?.includes('ZONAL') || guide.stateRules.agriculturalLandWarning?.includes('Article 371C'));
  });
});
