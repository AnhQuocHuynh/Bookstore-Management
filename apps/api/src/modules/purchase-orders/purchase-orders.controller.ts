import { Body, Controller, Get, HttpStatus, Post, Query } from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import {
  CreatePurchaseOrderDto,
  GetPurchaseOrdersQueryDto,
} from '@/common/dtos';
import { BookStoreId, Roles, UserSession } from '@/common/decorators';
import { TUserSession } from '@/common/utils';
import { UserRole } from '@/modules/users/enums';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller('purchase-orders')
@ApiTags('PurchaseOrdersController')
@ApiBearerAuth()
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @ApiOperation({
    summary: 'Tạo mới đơn mua hàng',
    description:
      'Đường dẫn này dùng để tạo mới đơn mua hàng, chỉ có NHÂN VIÊN cửa hàng mới có quyền thực hiện hành động này.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Dữ liệu trả về.',
    example: {
      id: 'c5b9e299-54dc-45a2-b607-fc790f9e8a73',
      totalAmount: 500000,
      purchaseDate: null,
      status: 'draft',
      note: 'Mua hàng từ nhà cung cấp',
      details: [
        {
          id: 'ac1ffdd6-d99b-4c85-8c8b-509134bada3a',
          quantity: 10,
          unitPrice: 50000,
          subTotal: 500000,
          createdAt: '2025-12-07T19:39:21.554Z',
          updatedAt: '2025-12-07T19:39:21.554Z',
        },
      ],
      createdAt: '2025-12-07T19:39:21.554Z',
      updatedAt: '2025-12-07T19:39:21.554Z',
    },
  })
  @Roles(UserRole.EMPLOYEE)
  @Post()
  async createPurchaseOrder(
    @Body() createPurchaseOrderDto: CreatePurchaseOrderDto,
    @UserSession() userSession: TUserSession,
  ) {
    return this.purchaseOrdersService.createPurchaseOrder(
      createPurchaseOrderDto,
      userSession,
    );
  }

  @ApiOperation({
    summary: 'Lấy danh sách đơn mua (phiếu nhập)',
    description: 'Đường dẫn này dùng để lấy danh sách đơn mua (phiếu nhập).',
  })
  @Roles(UserRole.EMPLOYEE, UserRole.OWNER)
  @ApiResponse({
    status: HttpStatus.OK,
    example: [
      {
        id: 'c5b9e299-54dc-45a2-b607-fc790f9e8a73',
        employee: {
          id: '947f7b62-6a70-4fc7-9fe0-2620d006b4c1',
          email: 'emberrestaurant94@gmail.com',
          username: 'tunv20050841sjAF',
          isActive: true,
          isFirstLogin: false,
          role: 'STAFF',
          fullName: 'Nguyễn Văn Tú',
          address: null,
          phoneNumber: '0393878913',
          birthDate: '2005-08-20T00:00:00.000Z',
          avatarUrl: null,
          createdAt: '2025-12-06T18:58:39.384Z',
          updatedAt: '2025-12-06T19:02:31.751Z',
        },
        totalAmount: 500000,
        purchaseDate: null,
        status: 'draft',
        note: 'Mua hàng từ nhà cung cấp',
        createdAt: '2025-12-07T19:39:21.554Z',
        updatedAt: '2025-12-07T19:39:21.554Z',
      },
    ],
  })
  @Get()
  async getPurchaseOrders(
    @Query() getPurchaseOrdersQueryDto: GetPurchaseOrdersQueryDto,
    @BookStoreId() bookStoreId: string,
  ) {
    return this.purchaseOrdersService.getPurchaseOrders(
      getPurchaseOrdersQueryDto,
      bookStoreId,
    );
  }
}
