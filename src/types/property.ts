export type PropertyType = 'land' | 'flat' | 'house' | 'commercial';
export type Purpose = 'live' | 'investment' | 'business' | 'rent';
export type MoveTimeline = 'within-6-months' | '6-12-months' | '1-2-years' | 'not-sure';
export type AreaUnit = 'sqft' | 'sqm' | 'sqyd';
export type Recommendation = 'BUY' | 'RENT' | 'WAIT';

export interface LocationDetails {
  address: string;
  lat: number;
  lng: number;
  city: string;
  state: string;
}

export interface PropertyInput {
  type: PropertyType;
  location: string;
  locationDetails: LocationDetails;
  price: number;
  area: number;
  areaUnit: AreaUnit;
  purpose: Purpose;
  age: string;
  floor: string;
  amenities: string[];
  moveTimeline: MoveTimeline;
}

export interface NearbyPlace {
  name: string;
  type: string;
  distance: string;
  distanceKm: number;
  icon: string;
}

export interface PropertyListing {
  id: string;
  name: string;
  type: PropertyType;
  location: string;
  city: string;
  price: number;
  area: number;
  areaUnit: AreaUnit;
  score: number;
  recommendation: Recommendation;
  date: string;
  imageUrl?: string;
}
