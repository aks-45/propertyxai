import { mockLocations } from '../data/mockLocations';
import { mockProperties } from '../data/mockProperties';
import { generateMockAnalysis } from '../data/mockAnalysis';
import { mockSavedReports } from '../data/mockUser';
import { AnalysisResult, BreakDecisionItem } from '../types/analysis';
import { PropertyInput, PropertyListing, LocationDetails } from '../types/property';
import { SavedReport } from '../types/user';
import { getFromStorage, saveToStorage, STORAGE_KEYS } from './storage';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const locationService = {
  searchLocations: async (query: string): Promise<LocationDetails[]> => {
    await delay(300);
    const q = query.toLowerCase();
    return mockLocations.filter((loc: any) => loc.address.toLowerCase().includes(q) || loc.city.toLowerCase().includes(q));
  },
  getLocationDetails: async (address: string): Promise<LocationDetails | undefined> => {
    await delay(200);
    return mockLocations.find((loc: any) => loc.address === address);
  }
};

export const propertyService = {
  getProperties: async (): Promise<PropertyListing[]> => {
    await delay(500);
    return mockProperties;
  },
  getPropertyById: async (id: string): Promise<PropertyListing | undefined> => {
    await delay(300);
    return mockProperties.find(p => p.id === id);
  },
  saveReport: async (report: SavedReport): Promise<void> => {
    await delay(200);
    const current = getFromStorage<SavedReport[]>(STORAGE_KEYS.SAVED_REPORTS) || mockSavedReports;
    saveToStorage(STORAGE_KEYS.SAVED_REPORTS, [report, ...current]);
  },
  getSavedReports: async (): Promise<SavedReport[]> => {
    await delay(400);
    return getFromStorage<SavedReport[]>(STORAGE_KEYS.SAVED_REPORTS) || mockSavedReports;
  },
  deleteSavedReport: async (id: string): Promise<void> => {
    await delay(200);
    const current = getFromStorage<SavedReport[]>(STORAGE_KEYS.SAVED_REPORTS) || [];
    saveToStorage(STORAGE_KEYS.SAVED_REPORTS, current.filter(r => r.id !== id));
  }
};

export const analysisService = {
  analyzeProperty: async (input: PropertyInput): Promise<AnalysisResult> => {
    await delay(3000);
    return generateMockAnalysis(input);
  }
};

export const aiService = {
  getBreakDecision: async (analysisId: string): Promise<BreakDecisionItem[]> => {
    await delay(1500);
    return [
      { id: 'bd1', category: 'good', title: 'Excellent Connectivity', description: 'Close to major highways and metro stations.', severity: 'high' },
      { id: 'bd2', category: 'good', title: 'Appreciation Potential', description: 'Upcoming IT park within 5km radius.', severity: 'medium' },
      { id: 'bd3', category: 'warning', title: 'High Maintenance', description: 'Monthly maintenance is above average for the area.', severity: 'medium' },
      { id: 'bd4', category: 'risk', title: 'Traffic Congestion', description: 'Peak hour traffic can be severe in this locality.', severity: 'high' },
      { id: 'bd5', category: 'assumption', title: 'Stable Job Market', description: 'Assuming the local IT sector continues to grow.', severity: 'low' },
      { id: 'bd6', category: 'uncertainty', title: 'Policy Changes', description: 'Potential changes in local zoning laws.', severity: 'medium' }
    ];
  }
};
