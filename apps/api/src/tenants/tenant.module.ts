import { TenantService } from '@/tenants/tenant.service';
import { Global, Module } from '@nestjs/common';

@Global()
@Module({
  providers: [TenantService],
  exports: [TenantService],
})
export class TenantModule {}
