import { Body, Controller, Post } from '@nestjs/common';
import { CartsService } from './cart.service';
import { Roles, UserSession } from '@/common/decorators';
import { UserRole } from '@/modules/users/enums';
import { CreateCartDto } from '@/common/dtos/cart';
import { TUserSession } from '@/common/utils';

@Controller('carts')
export class CartController {
  constructor(private readonly cartService: CartsService) {}

  @Post()
  @Roles(UserRole.CUSTOMER)
  async createCart(
    @Body() createCartDto: CreateCartDto,
    @UserSession() userSession: TUserSession,
  ) {
    return this.cartService.createNewCart(createCartDto, userSession);
  }
}
