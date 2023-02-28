import { Controller, Get, Inject, CACHE_MANAGER } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Controller()
export class AppController {
  randomNumDbs = Math.floor(Math.random() * 10);
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  @Get('get-number-cache')
  async getNumber(): Promise<any> {
    const val = await this.cacheManager.get('name');
    if (val) {
      return {
        data: val,
        FromRedis: 'this is loaded from redis cache',
      };
    }

    await this.cacheManager.set('name', {});
    if (!val) {
      return {
        data: this.randomNumDbs,
        FromRandomNumDbs: 'this is loaded from randomNumDbs',
      };
    }
  }
}
