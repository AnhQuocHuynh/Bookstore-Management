import { RedisClient } from '@/common/providers';
import { TenantService } from '@/tenants/tenant.service';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  providers: [TenantService, RedisClient],
  exports: [TenantService],
})
export class TenantModule {}
