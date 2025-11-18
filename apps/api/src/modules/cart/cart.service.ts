import { CreateCartDto } from '@/common/dtos/cart';
import { TUserSession } from '@/common/utils';
import { Cart, CartItem } from '@/database/tenant/entities';
import { TenantService } from '@/tenants/tenant.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CartsService {
  constructor(private readonly tenantService: TenantService) {}

  async createNewCart(createCartDto: CreateCartDto, userSession: TUserSession) {
    const { bookStoreId } = userSession;

    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const cartRepo = dataSource.getRepository(Cart);
    const cartItemRepo = dataSource.getRepository(CartItem);

    const {} = createCartDto;
  }

  private async createCartItem() {}
}
