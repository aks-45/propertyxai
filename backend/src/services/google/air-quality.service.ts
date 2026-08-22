import axios from 'axios';
import { LocationCacheService } from './location-cache.service';

export interface AirQualityInfo {
  aqi: number;
  category: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous' | 'Unknown';
  color: string;
  dominantPollutant: string;
  lastUpdateTime: string;
}

export class AirQualityService {
  private cache: LocationCacheService;
  private apiKey: string | undefined;

  constructor(cache?: LocationCacheService) {
    this.cache = cache || new LocationCacheService();
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY && process.env.GOOGLE_MAPS_API_KEY !== 'your-google-maps-api-key-here'
      ? process.env.GOOGLE_MAPS_API_KEY
      : undefined;
  }

  async getAirQuality(lat: number, lng: number, city?: string): Promise<AirQualityInfo> {
    const cacheKey = `aqi:${lat.toFixed(2)},${lng.toFixed(2)}`;
    // Short cache TTL for AQI: 3 hours (10800 seconds)
    const cached = await this.cache.get<AirQualityInfo>('air_quality', cacheKey);
    if (cached) return cached;

    if (this.apiKey) {
      try {
        const response = await axios.post(
          `https://airquality.googleapis.com/v1/currentConditions:lookup?key=${this.apiKey}`,
          {
            location: {
              latitude: lat,
              longitude: lng,
            },
            extraComputations: ['LOCAL_AQI', 'POLLUTANT_ADDITIONAL_INFO'],
          },
          { timeout: 4000 }
        );

        if (response.data?.indexes?.length > 0) {
          const index = response.data.indexes[0];
          const aqi = index.aqi || 75;
          const category = this.getCategoryFromAqi(aqi);

          const aqiInfo: AirQualityInfo = {
            aqi,
            category,
            color: this.getColorForCategory(category),
            dominantPollutant: index.dominantPollutant || 'PM2.5',
            lastUpdateTime: response.data.dateTime || new Date().toISOString(),
          };

          await this.cache.set('air_quality', cacheKey, aqiInfo, 10800);
          return aqiInfo;
        }
      } catch (error) {
        console.warn('Google Air Quality API error, using regional index:', (error as Error).message);
      }
    }

    const fallback = this.getRegionalFallback(city);
    await this.cache.set('air_quality', cacheKey, fallback, 10800);
    return fallback;
  }

  private getCategoryFromAqi(aqi: number): AirQualityInfo['category'] {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  }

  private getColorForCategory(category: AirQualityInfo['category']): string {
    switch (category) {
      case 'Good': return '#10B981';
      case 'Moderate': return '#FBBF24';
      case 'Unhealthy for Sensitive Groups': return '#F97316';
      case 'Unhealthy': return '#EF4444';
      case 'Very Unhealthy': return '#8B5CF6';
      case 'Hazardous': return '#7F1D1D';
      default: return '#6B7280';
    }
  }

  private getRegionalFallback(city?: string): AirQualityInfo {
    const cityName = (city || '').toLowerCase();
    let aqi = 85;
    let dominantPollutant = 'PM2.5';

    if (cityName.includes('delhi') || cityName.includes('noida') || cityName.includes('gurugram')) {
      aqi = 135;
      dominantPollutant = 'PM2.5';
    } else if (cityName.includes('bangalore') || cityName.includes('chennai') || cityName.includes('pune')) {
      aqi = 58;
      dominantPollutant = 'PM10';
    } else if (cityName.includes('mumbai') || cityName.includes('hyderabad')) {
      aqi = 78;
      dominantPollutant = 'PM2.5';
    }

    const category = this.getCategoryFromAqi(aqi);

    return {
      aqi,
      category,
      color: this.getColorForCategory(category),
      dominantPollutant,
      lastUpdateTime: new Date().toISOString(),
    };
  }
}
