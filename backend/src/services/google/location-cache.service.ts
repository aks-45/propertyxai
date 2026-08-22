import prisma from '../../config/database';

export class LocationCacheService {
  /**
   * Get cached data by requestType and requestKey
   */
  async get<T = any>(requestType: string, requestKey: string): Promise<T | null> {
    try {
      const cached = await prisma.locationCache.findUnique({
        where: {
          requestType_requestKey: {
            requestType,
            requestKey,
          },
        },
      });

      if (!cached) return null;

      // Check TTL expiration
      if (new Date() > new Date(cached.expiresAt)) {
        await prisma.locationCache.delete({
          where: { id: cached.id },
        }).catch(() => {});
        return null;
      }

      return cached.response as T;
    } catch (error) {
      console.error('Location cache read error:', error);
      return null;
    }
  }

  /**
   * Set cached data with TTL in seconds (default 24 hours)
   */
  async set(requestType: string, requestKey: string, data: any, ttlSeconds: number = 86400): Promise<void> {
    try {
      const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

      await prisma.locationCache.upsert({
        where: {
          requestType_requestKey: {
            requestType,
            requestKey,
          },
        },
        update: {
          response: data,
          expiresAt,
          updatedAt: new Date(),
        },
        create: {
          requestType,
          requestKey,
          response: data,
          expiresAt,
        },
      });
    } catch (error) {
      console.error('Location cache write error:', error);
    }
  }
}