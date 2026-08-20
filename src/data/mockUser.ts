import { User, Alert, SavedReport } from '../types/user';

export const mockUser: User = {
  id: 'u_1',
  name: 'Arjun Sharma',
  email: 'arjun@example.com',
  phone: '+91 9876543210',
  avatar: 'https://i.pravatar.cc/150?u=arjun',
  preferences: {
    preferredCities: ['Pune', 'Bengaluru', 'Mumbai'],
    budgetRange: { min: 5000000, max: 15000000 },
    propertyTypes: ['flat', 'land'],
    notificationsEnabled: true
  }
};

export const mockAlerts: Alert[] = [
  { id: 'a_1', title: 'Property Match', description: 'A new 2BHK in Baner matches your preferences.', type: 'info', read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'a_2', title: 'Price Drop', description: 'The property you saved in Whitefield just had a 5% price drop.', type: 'success', read: false, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'a_3', title: 'Market Trend', description: 'Property rates in Koregaon Park are expected to rise.', type: 'warning', read: true, createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 'a_4', title: 'New Area Highlight', description: 'Check out emerging opportunities in Wagholi.', type: 'info', read: true, createdAt: new Date(Date.now() - 259200000).toISOString() },
  { id: 'a_5', title: 'Report Expiring', description: 'Your saved report for Hinjewadi is over 3 months old.', type: 'warning', read: true, createdAt: new Date(Date.now() - 345600000).toISOString() }
];

export const mockSavedReports: SavedReport[] = [
  { id: 'sr_1', analysisId: 'an_101', propertyName: 'Spacious 2BHK in Baner', location: 'Baner, Pune', price: 7500000, score: 85, recommendation: 'BUY', savedAt: new Date(Date.now() - 43200000).toISOString() },
  { id: 'sr_2', analysisId: 'an_102', propertyName: 'Investment Plot in Hinjewadi', location: 'Hinjewadi, Pune', price: 2500000, score: 72, recommendation: 'WAIT', savedAt: new Date(Date.now() - 129600000).toISOString() },
  { id: 'sr_3', analysisId: 'an_103', propertyName: 'Luxury Villa', location: 'Whitefield, Bengaluru', price: 25000000, score: 91, recommendation: 'BUY', savedAt: new Date(Date.now() - 259200000).toISOString() }
];
