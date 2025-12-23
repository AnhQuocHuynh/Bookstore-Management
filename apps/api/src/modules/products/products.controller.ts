import { BookStoreId, Roles, UserSession } from '@/common/decorators';
import {
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
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';

@Controller('products')
@ApiTags('Sản phẩm')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiOperation({
    summary: 'Lấy chi tiết thông tin sản phẩm',
    description: 'Đường dẫn này dùng để lấy chi tiết thông tin sản phẩm.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: {
      id: 'ff7a231d-bc3b-4888-be88-b4754395dae3',
      sku: 'STA-39581-434',
      name: 'Product 1',
      description: 'Mô tả cho sản phẩm 1',
      price: 200000,
      type: 'stationery',
      isActive: true,
      createdAt: '2025-12-07T19:30:39.195Z',
      updatedAt: '2025-12-07T19:30:39.195Z',
      supplier: {
        id: '2bf8dcb3-cacc-427c-ad7d-464a715c0089',
        name: 'Nhà cung cấp 1',
        email: 'nhacc1@gmail.com',
        phoneNumber: '+84323454323',
        address: 'HCM',
        status: 'active',
        taxCode: null,
        contactPerson: null,
        note: null,
        createdAt: '2025-12-07T19:08:32.794Z',
        updatedAt: '2025-12-07T19:08:32.794Z',
      },
      inventory: {
        id: 'c509b5a2-72da-4448-98a0-1268d75a7990',
        stockQuantity: 100,
        displayQuantity: 0,
        availableQuantity: 100,
        costPrice: 200000,
        createdAt: '2025-12-07T19:30:39.195Z',
        updatedAt: '2025-12-07T19:30:39.195Z',
      },
      categories: [
        {
          id: 'fff8451c-0a47-4847-9185-b3aad752dd6f',
          name: 'Danh mục 1',
          slug: 'danh-muc-1',
          description: 'Mô tả cho danh mục 1',
          status: 'active',
          taxRate: 0.2,
          createdAt: '2025-12-07T19:13:01.149Z',
          updatedAt: '2025-12-07T19:13:01.149Z',
        },
      ],
      book: null,
      deletedAt: null,
    },
  })
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

  @ApiOperation({
    summary: 'Lấy danh sách sản phẩm.',
    description: 'Đường dẫn này dùng để lấy danh sách sản phẩm.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: [
      {
        id: 'ff7a231d-bc3b-4888-be88-b4754395dae3',
        sku: 'STA-39581-434',
        name: 'Product 1',
        description: 'Mô tả cho sản phẩm 1',
        price: 200000,
        type: 'stationery',
        isActive: true,
        createdAt: '2025-12-07T19:30:39.195Z',
        updatedAt: '2025-12-07T19:30:39.195Z',
        supplier: {
          id: '2bf8dcb3-cacc-427c-ad7d-464a715c0089',
          name: 'Nhà cung cấp 1',
          email: 'nhacc1@gmail.com',
          phoneNumber: '+84323454323',
          address: 'HCM',
          status: 'active',
          taxCode: null,
          contactPerson: null,
          note: null,
          createdAt: '2025-12-07T19:08:32.794Z',
          updatedAt: '2025-12-07T19:08:32.794Z',
        },
        inventory: {
          id: 'c509b5a2-72da-4448-98a0-1268d75a7990',
          stockQuantity: 100,
          displayQuantity: 0,
          availableQuantity: 100,
          costPrice: 200000,
          createdAt: '2025-12-07T19:30:39.195Z',
          updatedAt: '2025-12-07T19:30:39.195Z',
        },
        categories: [
          {
            id: 'fff8451c-0a47-4847-9185-b3aad752dd6f',
            name: 'Danh mục 1',
            slug: 'danh-muc-1',
            description: 'Mô tả cho danh mục 1',
            status: 'active',
            taxRate: 0.2,
            createdAt: '2025-12-07T19:13:01.149Z',
            updatedAt: '2025-12-07T19:13:01.149Z',
          },
        ],
        book: null,
        deletedAt: null,
      },
    ],
  })
  @Get()
  @Roles(UserRole.EMPLOYEE, UserRole.OWNER)
  async getProducts(
    @Query() getProductsQueryDto: GetProductsQueryDto,
    @UserSession() userSession: TUserSession,
  ) {
    return this.productsService.getProducts(getProductsQueryDto, userSession);
  }

  @ApiOperation({
    summary: 'Xoá (mềm) sản phẩm.',
    description:
      'Đường dẫn này dùng để xoá (mềm) sản phẩm, chỉ có CHỦ NHÀ SÁCH mới có quyền thực hiện hành động này.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: {
      message: 'Sản phẩm đã được xoá thành công.',
      success: true,
    },
  })
  @Delete('detail')
  @Roles(UserRole.OWNER)
  async deleteProduct(
    @Query() getProductDetailQueryDto: GetProductDetailQueryDto,
    @BookStoreId() bookStoreId: string,
  ) {
    return this.productsService.deleteProduct(
      getProductDetailQueryDto,
      bookStoreId,
    );
  }

  @ApiOperation({
    summary: 'Cập nhật sản phẩm',
    description: 'Đường dẫn này dùng để cập nhật sản phẩm.',
  })
  @ApiParam({
    name: 'id',
    description: 'Id của sản phẩm',
    example: 'ff7a231d-bc3b-4888-be88-b4754395dae3',
  })
  @ApiBody({
    type: UpdateProductDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: {
      id: 'ff7a231d-bc3b-4888-be88-b4754395dae3',
      sku: 'STA-39581-434',
      name: 'Product 1',
      description: 'Mô tả abc',
      price: 200000,
      type: 'stationery',
      isActive: false,
      createdAt: '2025-12-07T19:30:39.195Z',
      updatedAt: '2025-12-14T06:30:55.740Z',
      supplier: {
        id: '2bf8dcb3-cacc-427c-ad7d-464a715c0089',
        name: 'Nhà cung cấp 1',
        email: 'nhacc1@gmail.com',
        phoneNumber: '+84323454323',
        address: 'HCM',
        status: 'active',
        taxCode: null,
        contactPerson: null,
        note: null,
        createdAt: '2025-12-07T19:08:32.794Z',
        updatedAt: '2025-12-07T19:08:32.794Z',
      },
      inventory: {
        id: 'c509b5a2-72da-4448-98a0-1268d75a7990',
        stockQuantity: 100,
        displayQuantity: 0,
        availableQuantity: 100,
        costPrice: 200000,
        createdAt: '2025-12-07T19:30:39.195Z',
        updatedAt: '2025-12-07T19:30:39.195Z',
      },
      categories: [
        {
          id: 'fff8451c-0a47-4847-9185-b3aad752dd6f',
          name: 'Danh mục 1',
          slug: 'danh-muc-1',
          description: 'Mô tả cho danh mục 1',
          status: 'active',
          taxRate: 0.2,
          createdAt: '2025-12-07T19:13:01.149Z',
          updatedAt: '2025-12-07T19:13:01.149Z',
        },
      ],
      book: null,
      deletedAt: null,
    },
  })
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
