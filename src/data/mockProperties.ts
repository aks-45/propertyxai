import { PropertyListing } from '../types/property';

export const mockProperties: PropertyListing[] = [
  { id: 'p_1', name: '2BHK Flat in Pune', type: 'flat', location: 'Koregaon Park', city: 'Pune', price: 6500000, area: 1100, areaUnit: 'sqft', score: 82, recommendation: 'BUY', date: new Date().toISOString() },
  { id: 'p_2', name: 'Residential Plot in Kanpur', type: 'land', location: 'Aliganj', city: 'Kanpur', price: 1600000, area: 150, areaUnit: 'sqyd', score: 74, recommendation: 'WAIT', date: new Date().toISOString() },
  { id: 'p_3', name: 'Office Space in Noida', type: 'commercial', location: 'Sector 62', city: 'Noida', price: 12000000, area: 2000, areaUnit: 'sqft', score: 65, recommendation: 'RENT', date: new Date().toISOString() },
  { id: 'p_4', name: '3BHK Apartment in Bengaluru', type: 'flat', location: 'Whitefield', city: 'Bengaluru', price: 9500000, area: 1600, areaUnit: 'sqft', score: 88, recommendation: 'BUY', date: new Date().toISOString() },
  { id: 'p_5', name: 'Villa in Hyderabad', type: 'house', location: 'Gachibowli', city: 'Hyderabad', price: 14500000, area: 3500, areaUnit: 'sqft', score: 79, recommendation: 'BUY', date: new Date().toISOString() },
  { id: 'p_6', name: 'Studio in Mumbai', type: 'flat', location: 'Andheri', city: 'Mumbai', price: 7800000, area: 450, areaUnit: 'sqft', score: 71, recommendation: 'WAIT', date: new Date().toISOString() }
];
