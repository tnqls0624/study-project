import { Inject, Module } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

export interface CACHE_GENERATOR {
  setCache(key: string, value: unknown, ttl: number): Promise<boolean>;
  getCache(key: string): Promise<unknown>;
  delCache(key: string): Promise<boolean>;
}

class CacheGeneratorImplement implements CACHE_GENERATOR {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async setCache(key: string, value: unknown, ttl: number): Promise<boolean> {
    await this.cacheManager.store.set(key, value, { ttl });
    return true;
  }
  async getCache(key: string): Promise<unknown> {
    const cache = await this.cacheManager.get(key);
    return cache;
  }

  async delCache(key: string): Promise<any> {
    await this.cacheManager.del(key);
    return true;
  }
}

export const CACHE_GENERATOR = 'CACHE_GENERATOR';

@Module({
  providers: [
    {
      provide: CACHE_GENERATOR,
      useClass: CacheGeneratorImplement,
    },
  ],
  exports: [CACHE_GENERATOR],
})
export class CacheModule {}
