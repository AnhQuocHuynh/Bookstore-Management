import { BookStoreId, Roles, UserSession } from '@/common/decorators';
import {
  CreateProductDto,
  GetProductDetailQueryDto,
  GetProductsQueryDto,
  UpdateProductDto,
} from '@/common/dtos/products';
import { TUserSession } from '@/common/utils';
import { UserRole } from '@/modules/users/enums';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('detail')
  @Roles(UserRole.EMPLOYEE, UserRole.OWNER)
  async getProductDetail(
    @Query() getProductDetailQueryDto: GetProductDetailQueryDto,
    @BookStoreId() bookStoreId: string,
  ) {
    return this.productsService.getProductDetail(
      getProductDetailQueryDto,
      bookStoreId,
    );
  }

  @Post()
  @Roles(UserRole.EMPLOYEE)
  async createProduct(
    @UserSession() userSession: TUserSession,
    @Body() createProductDto: CreateProductDto,
  ) {
    return this.productsService.createProduct(userSession, createProductDto);
  }

  @Get()
  @Roles(UserRole.EMPLOYEE, UserRole.OWNER)
  async getProducts(
    @Query() getProductsQueryDto: GetProductsQueryDto,
    @UserSession() userSession: TUserSession,
  ) {
    return this.productsService.getProducts(getProductsQueryDto, userSession);
  }

  @Delete('detail')
  @Roles(UserRole.OWNER)
  async deleteProduct(
    @Query() getProductsQueryDto: GetProductsQueryDto,
    @BookStoreId() bookStoreId: string,
  ) {
    return this.productsService.deleteProduct(getProductsQueryDto, bookStoreId);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.EMPLOYEE)
  async updateProduct(
    @Param('id', ParseUUIDPipe) productId: string,
    @BookStoreId() bookStoreId: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(
      productId,
      bookStoreId,
      updateProductDto,
    );
  }
}
