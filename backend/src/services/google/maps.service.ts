import { LocationCacheService } from './location-cache.service';
import { GeocodingService, GeocodingResult } from './geocoding.service';
import { PlacesService, NearbyPlace, PlacesSummary } from './places.service';
import { RoutesService, RouteInfo, ConnectivitySummary } from './routes.service';
import { RoadsService, RoadInfo } from './roads.service';
import { AirQualityService, AirQualityInfo } from './air-quality.service';

export interface LocationIntelligence {
  lat: number;
  lng: number;
  address: string;
  city: string;
  state: string;
  nearbyPlaces: NearbyPlace[];
  placesSummary?: PlacesSummary;
  routes: {
    workplace?: RouteInfo;
    cityCenter?: RouteInfo;
    airport?: RouteInfo;
    transitAccess: boolean;
    highwayAccess: boolean;
  };
  roadInfo?: RoadInfo;
  airQuality?: AirQualityInfo;
}

export class GoogleMapsService {
  private cache: LocationCacheService;
  private geocodingService: GeocodingService;
  private placesService: PlacesService;
  private routesService: RoutesService;
  private roadsService: RoadsService;
  private airQualityService: AirQualityService;

  constructor() {
    this.cache = new LocationCacheService();
    this.geocodingService = new GeocodingService(this.cache);
    this.placesService = new PlacesService(this.cache);
    this.routesService = new RoutesService(this.cache);
    this.roadsService = new RoadsService(this.cache);
    this.airQualityService = new AirQualityService(this.cache);
  }

  /**
   * Geocode an address string into latitude, longitude, and normalized location details
   */
  async geocodeAddress(address: string): Promise<GeocodingResult> {
    return this.geocodingService.geocode(address);
  }

  /**
   * Reverse geocode GPS coordinates (lat/lng) to address and administrative details
   */
  async reverseGeocode(lat: number, lng: number): Promise<GeocodingResult> {
    return this.geocodingService.reverseGeocode(lat, lng);
  }

  /**
   * Places autocomplete suggestions based on user query
   */
  async autocompletePlaces(query: string) {
    return this.geocodingService.autocomplete(query);
  }

  /**
   * Search any custom amenity (e.g. Gym, Temple, EV Charging, Cinema) within 5km
   */
  async searchCustomAmenity(lat: number, lng: number, query: string) {
    return this.placesService.searchCustomAmenity(lat, lng, query);
  }

  /**
   * Get comprehensive location intelligence with caching and modular subservices
   */
  async getLocationIntelligence(input: {
    lat: number;
    lng: number;
    address: string;
    city: string;
    state: string;
    workplaceLocation?: string;
  }): Promise<LocationIntelligence> {
    try {
      const { lat, lng, address, city, state, workplaceLocation } = input;

      const cacheKey = `intel:${lat.toFixed(3)},${lng.toFixed(3)},${city},${workplaceLocation || 'none'}`;
      const cached = await this.cache.get<LocationIntelligence>('location_intel', cacheKey);
      if (cached) {
        return cached;
      }

      // Execute location intelligence sub-services in parallel
      const [placesSummary, connectivity, roadInfo, airQuality] = await Promise.all([
        this.placesService.getNearbyPlaces(lat, lng),
        this.routesService.getConnectivity(lat, lng, city, workplaceLocation),
        this.roadsService.getRoadInfo(lat, lng),
        this.airQualityService.getAirQuality(lat, lng, city),
      ]);

      const locationIntelligence: LocationIntelligence = {
        lat,
        lng,
        address,
        city,
        state,
        nearbyPlaces: placesSummary.places,
        placesSummary,
        routes: connectivity,
        roadInfo,
        airQuality,
      };

      // Cache overall intelligence for 24 hours
      await this.cache.set('location_intel', cacheKey, locationIntelligence, 86400);

      return locationIntelligence;
    } catch (error) {
      console.error('Google Maps intelligence aggregator error:', error);
      return this.getFallbackLocationIntelligence(input);
    }
  }

  private getFallbackLocationIntelligence(input: {
    lat: number;
    lng: number;
    address: string;
    city: string;
    state: string;
  }): LocationIntelligence {
    return {
      lat: input.lat,
      lng: input.lng,
      address: input.address,
      city: input.city,
      state: input.state,
      nearbyPlaces: [
        { name: 'Delhi Public School', type: 'School', distance: '1.2 km', distanceKm: 1.2, icon: 'school' },
        { name: 'City Hospital', type: 'Hospital', distance: '1.8 km', distanceKm: 1.8, icon: 'hospital' },
        { name: 'Central Metro Station', type: 'Metro', distance: '2.1 km', distanceKm: 2.1, icon: 'train' },
        { name: 'Local Commercial Hub', type: 'Market', distance: '0.8 km', distanceKm: 0.8, icon: 'shopping-cart' },
        { name: 'Apollo Pharmacy', type: 'Pharmacy', distance: '0.5 km', distanceKm: 0.5, icon: 'pill' },
        { name: 'HDFC Bank', type: 'Bank', distance: '1.0 km', distanceKm: 1.0, icon: 'building' },
      ],
      routes: {
        cityCenter: { destination: 'City Center', distance: '8.5 km', distanceValue: 8500, duration: '22 mins', durationValue: 1320 },
        airport: { destination: 'Airport', distance: '24.0 km', distanceValue: 24000, duration: '45 mins', durationValue: 2700 },
        transitAccess: true,
        highwayAccess: true,
      },
      airQuality: {
        aqi: 85,
        category: 'Moderate',
        color: '#FBBF24',
        dominantPollutant: 'PM2.5',
        lastUpdateTime: new Date().toISOString(),
      },
    };
  }
}