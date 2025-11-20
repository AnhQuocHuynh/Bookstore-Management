import { Body, Controller, Post } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Roles, UserSession } from '@/common/decorators';
import { UserRole } from '@/modules/users/enums';
import { TUserSession } from '@/common/utils';
import { CreateProductDto } from '@/common/dtos/products';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(UserRole.OWNER)
  async createProduct(
    @UserSession() userSession: TUserSession,
    @Body() createProductDto: CreateProductDto,
  ) {
    return this.productsService.createProduct(userSession, createProductDto);
  }
}
