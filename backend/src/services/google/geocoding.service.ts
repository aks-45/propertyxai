import axios from 'axios';
import { LocationCacheService } from './location-cache.service';

export interface GeocodingResult {
  lat: number;
  lng: number;
  formattedAddress: string;
  city: string;
  state: string;
  district?: string;
  postalCode?: string;
}

export interface AutocompletePrediction {
  description: string;
  mainText: string;
  secondaryText: string;
  placeId?: string;
  lat?: number;
  lng?: number;
  city?: string;
  state?: string;
}

const CITY_COORDINATES: Record<string, { lat: number; lng: number; state: string }> = {
  noida: { lat: 28.5355, lng: 77.3910, state: 'Uttar Pradesh' },
  lucknow: { lat: 26.8467, lng: 80.9462, state: 'Uttar Pradesh' },
  delhi: { lat: 28.6139, lng: 77.2090, state: 'Delhi' },
  gurugram: { lat: 28.4595, lng: 77.0266, state: 'Haryana' },
  gurgaon: { lat: 28.4595, lng: 77.0266, state: 'Haryana' },
  bangalore: { lat: 12.9716, lng: 77.5946, state: 'Karnataka' },
  bengaluru: { lat: 12.9716, lng: 77.5946, state: 'Karnataka' },
  mumbai: { lat: 19.0760, lng: 72.8777, state: 'Maharashtra' },
  pune: { lat: 18.5204, lng: 73.8567, state: 'Maharashtra' },
  hyderabad: { lat: 17.3850, lng: 78.4867, state: 'Telangana' },
  chennai: { lat: 13.0827, lng: 80.2707, state: 'Tamil Nadu' },
  kolkata: { lat: 22.5726, lng: 88.3639, state: 'West Bengal' },
  ahmedabad: { lat: 23.0225, lng: 72.5714, state: 'Gujarat' },
  jaipur: { lat: 26.9124, lng: 75.7873, state: 'Rajasthan' },
  chandigarh: { lat: 30.7333, lng: 76.7794, state: 'Chandigarh' },
  varanasi: { lat: 25.3176, lng: 82.9739, state: 'Uttar Pradesh' },
  kanpur: { lat: 26.4499, lng: 80.3319, state: 'Uttar Pradesh' },
  agra: { lat: 27.1767, lng: 78.0081, state: 'Uttar Pradesh' },
  prayagraj: { lat: 25.4358, lng: 81.8463, state: 'Uttar Pradesh' },
};

export class GeocodingService {
  private cache: LocationCacheService;
  private apiKey: string | undefined;

  constructor(cache?: LocationCacheService) {
    this.cache = cache || new LocationCacheService();
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY && process.env.GOOGLE_MAPS_API_KEY !== 'your-google-maps-api-key-here'
      ? process.env.GOOGLE_MAPS_API_KEY
      : undefined;
  }

  async geocode(address: string): Promise<GeocodingResult> {
    const cleanAddress = address.trim().toLowerCase();
    const cacheKey = `geocode:${cleanAddress}`;

    // 1. Check DB cache
    const cached = await this.cache.get<GeocodingResult>('geocoding', cacheKey);
    if (cached) {
      return cached;
    }

    // 2. Query Google Maps Geocoding API if key is present
    if (this.apiKey) {
      try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
          params: {
            address,
            key: this.apiKey,
            region: 'in',
          },
          timeout: 5000,
        });

        if (response.data.status === 'OK' && response.data.results.length > 0) {
          const result = response.data.results[0];
          const location = result.geometry.location;

          let city = '';
          let state = '';
          let district = '';
          let postalCode = '';

          for (const component of result.address_components) {
            const types = component.types;
            if (types.includes('locality')) {
              city = component.long_name;
            } else if (!city && types.includes('administrative_area_level_2')) {
              city = component.long_name;
            }
            if (types.includes('administrative_area_level_1')) {
              state = component.long_name;
            }
            if (types.includes('administrative_area_level_2')) {
              district = component.long_name;
            }
            if (types.includes('postal_code')) {
              postalCode = component.long_name;
            }
          }

          const geocodingResult: GeocodingResult = {
            lat: location.lat,
            lng: location.lng,
            formattedAddress: result.formatted_address,
            city: city || 'Unknown City',
            state: state || 'Unknown State',
            district: district || undefined,
            postalCode: postalCode || undefined,
          };

          await this.cache.set('geocoding', cacheKey, geocodingResult, 2592000);
          return geocodingResult;
        }
      } catch (error) {
        console.warn('Google Geocoding API error, trying Nominatim fallback:', (error as Error).message);
      }
    }

    // 3. Query OpenStreetMap Nominatim for exact place search (e.g. colleges, landmarks)
    try {
      const osmRes = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: address,
          format: 'json',
          addressdetails: 1,
          countrycodes: 'in',
          limit: 1,
        },
        headers: {
          'User-Agent': 'PropertyX-AI/1.0',
        },
        timeout: 4000,
      });

      if (osmRes.data && osmRes.data.length > 0) {
        const item = osmRes.data[0];
        const addr = item.address || {};
        const geocodingResult: GeocodingResult = {
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          formattedAddress: item.display_name,
          city: addr.city || addr.town || addr.suburb || addr.state_district || 'Lucknow',
          state: addr.state || 'Uttar Pradesh',
        };
        await this.cache.set('geocoding', cacheKey, geocodingResult, 2592000);
        return geocodingResult;
      }
    } catch {
      // Fallback
    }

    // 4. Fallback coordinate resolver
    const fallback = this.getFallbackGeocoding(address);
    await this.cache.set('geocoding', cacheKey, fallback, 86400);
    return fallback;
  }

  async reverseGeocode(lat: number, lng: number): Promise<GeocodingResult> {
    const cacheKey = `rev_geocode:${lat.toFixed(4)},${lng.toFixed(4)}`;

    const cached = await this.cache.get<GeocodingResult>('geocoding', cacheKey);
    if (cached) return cached;

    if (this.apiKey) {
      try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
          params: {
            latlng: `${lat},${lng}`,
            key: this.apiKey,
          },
          timeout: 5000,
        });

        if (response.data.status === 'OK' && response.data.results.length > 0) {
          const result = response.data.results[0];
          let city = '';
          let state = '';
          for (const component of result.address_components) {
            if (component.types.includes('locality') || component.types.includes('administrative_area_level_2')) {
              city = component.long_name;
            }
            if (component.types.includes('administrative_area_level_1')) {
              state = component.long_name;
            }
          }
          const reverseResult: GeocodingResult = {
            lat,
            lng,
            formattedAddress: result.formatted_address,
            city: city || 'Local Area',
            state: state || 'India',
          };
          await this.cache.set('geocoding', cacheKey, reverseResult, 2592000);
          return reverseResult;
        }
      } catch (err) {
        console.warn('Google Reverse Geocode API error:', (err as Error).message);
      }
    }

    // Free OpenStreetMap reverse geocoding fallback
    try {
      const osmRes = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: {
          lat,
          lon: lng,
          format: 'json',
        },
        headers: {
          'User-Agent': 'PropertyX-AI/1.0',
        },
        timeout: 4000,
      });

      if (osmRes.data && osmRes.data.display_name) {
        const addr = osmRes.data.address || {};
        const result: GeocodingResult = {
          lat,
          lng,
          formattedAddress: osmRes.data.display_name,
          city: addr.city || addr.town || addr.suburb || addr.state_district || 'Local Area',
          state: addr.state || 'India',
        };
        await this.cache.set('geocoding', cacheKey, result, 2592000);
        return result;
      }
    } catch {
      // Ignore OSM fallback failure
    }

    return {
      lat,
      lng,
      formattedAddress: `Location at ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`,
      city: 'Current Area',
      state: 'India',
    };
  }

  async autocomplete(query: string): Promise<AutocompletePrediction[]> {
    if (!query || query.trim().length === 0) {
      return [
        { description: 'Gomti Nagar Extension, Lucknow, Uttar Pradesh', mainText: 'Gomti Nagar Extension', secondaryText: 'Lucknow, Uttar Pradesh', lat: 26.8500, lng: 80.9900, city: 'Lucknow', state: 'Uttar Pradesh' },
        { description: 'Sector 62, Noida, Uttar Pradesh', mainText: 'Sector 62', secondaryText: 'Noida, Uttar Pradesh', lat: 28.6253, lng: 77.3732, city: 'Noida', state: 'Uttar Pradesh' },
        { description: 'Indiranagar, Bengaluru, Karnataka', mainText: 'Indiranagar', secondaryText: 'Bengaluru, Karnataka', lat: 12.9784, lng: 77.6408, city: 'Bengaluru', state: 'Karnataka' },
      ];
    }

    const cleanQuery = query.trim();
    const predictions: AutocompletePrediction[] = [];

    // 1. Google Places Autocomplete API if key is present
    if (this.apiKey) {
      try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/place/autocomplete/json', {
          params: {
            input: cleanQuery,
            components: 'country:in',
            key: this.apiKey,
          },
          timeout: 4000,
        });

        if (response.data.status === 'OK' && response.data.predictions) {
          response.data.predictions.forEach((p: any) => {
            predictions.push({
              description: p.description,
              mainText: p.structured_formatting?.main_text || p.description,
              secondaryText: p.structured_formatting?.secondary_text || '',
              placeId: p.place_id,
            });
          });
          if (predictions.length > 0) return predictions;
        }
      } catch (err) {
        console.warn('Google Places Autocomplete error:', (err as Error).message);
      }
    }

    // 2. Query Live OpenStreetMap Search API for colleges, universities, landmarks, localities
    try {
      const osmRes = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: cleanQuery,
          format: 'json',
          addressdetails: 1,
          countrycodes: 'in',
          limit: 6,
        },
        headers: {
          'User-Agent': 'PropertyX-AI/1.0',
        },
        timeout: 4000,
      });

      if (osmRes.data && Array.isArray(osmRes.data) && osmRes.data.length > 0) {
        osmRes.data.forEach((item: any) => {
          const addr = item.address || {};
          const mainText = item.name || item.display_name.split(',')[0];
          const secondary = [addr.city || addr.town || addr.state_district, addr.state].filter(Boolean).join(', ');

          predictions.push({
            description: item.display_name,
            mainText,
            secondaryText: secondary || 'India',
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            city: addr.city || addr.town || addr.state_district || 'Lucknow',
            state: addr.state || 'Uttar Pradesh',
          });
        });
      }
    } catch (osmErr) {
      console.warn('Nominatim autocomplete error:', osmErr);
    }

    // 3. Always include user query direct item at top
    const userOption: AutocompletePrediction = {
      description: cleanQuery,
      mainText: cleanQuery,
      secondaryText: 'Select this exact address / landmark',
    };

    return [userOption, ...predictions];
  }

  private getFallbackGeocoding(address: string): GeocodingResult {
    const lower = address.toLowerCase();
    for (const [cityName, data] of Object.entries(CITY_COORDINATES)) {
      if (lower.includes(cityName)) {
        return {
          lat: data.lat,
          lng: data.lng,
          formattedAddress: address,
          city: cityName.charAt(0).toUpperCase() + cityName.slice(1),
          state: data.state,
        };
      }
    }

    // Default fallback: Lucknow / Noida coordinates
    return {
      lat: 26.8467,
      lng: 80.9462,
      formattedAddress: address,
      city: 'Lucknow',
      state: 'Uttar Pradesh',
    };
  }
}
