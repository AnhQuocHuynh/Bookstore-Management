import { Roles, UserSession } from '@/common/decorators';
import { CreateOrderDto } from '@/common/dtos';
import { TUserSession } from '@/common/utils';
import { UserRole } from '@/modules/users/enums';
import { Body, Controller, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles(UserRole.CUSTOMER)
  async createOrder(
    @UserSession() userSession: TUserSession,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.ordersService.createOrder(userSession, createOrderDto);
  }
}
