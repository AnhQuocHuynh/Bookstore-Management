import { TenantService } from '@/tenants/tenant.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CartsService {
  constructor(private readonly tenantService: TenantService) {}

  async createNewCart() {}
}
