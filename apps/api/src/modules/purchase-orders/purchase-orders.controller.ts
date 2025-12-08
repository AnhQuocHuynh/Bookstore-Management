import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from '@/common/dtos';
import { Roles, UserSession } from '@/common/decorators';
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
}
