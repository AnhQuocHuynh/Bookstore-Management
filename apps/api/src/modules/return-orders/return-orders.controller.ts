import {
  AddReturnOrderDetailDto,
  CreateReturnOrderDto,
  RejectReturnOrderDto,
  UpdateReturnOrderDetailDto,
} from '@/common/dtos';
import { UserRole } from '@/modules/users/enums';
import { ReturnOrdersService } from './return-orders.service';
import {
  Body,
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BookStoreId, Roles, UserSession } from '@/common/decorators';
import { TUserSession } from '@/common/utils';
import { GetReturnOrdersQueryDto } from '@/common/dtos/return-orders/get-return-orders-query.dto';

@Controller('return-orders')
@ApiTags('Đơn trả/đổi hàng')
@ApiBearerAuth()
export class ReturnOrdersController {
  constructor(private readonly returnOrdersService: ReturnOrdersService) {}

  @ApiOperation({
    summary: 'Lấy danh sách đơn trả/đổi hàng',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: [
      {
        id: '351c1480-ec86-4619-86a0-2e89a597e8c6',
        employee: {
          id: '6a353274-ea64-47ca-96f0-57206a247608',
          email: 'ngocanh2k5uit1@example.com',
          username: 'tunv20060841qkAQ',
          isActive: true,
          isFirstLogin: false,
          role: 'STORE_MANAGER',
          employeeCode: 'SM0002',
          fullName: 'Huỳnh Anh Quốc',
          address: '123 Đường ABC, Hà Nội',
          phoneNumber: '0988655328',
          birthDate: '1995-06-14T17:00:00.000Z',
          avatarUrl: 'https://github.com/shadcn.png',
          createdAt: '2025-12-25T22:57:05.258Z',
          updatedAt: '2025-12-25T22:57:05.258Z',
        },
        customer: {
          id: '84c70455-17a8-4e85-a793-dcfe65634d3c',
          email: 'tien@example.com',
          fullName: 'Nguyễn Văn Tiến',
          phoneNumber: '0977998877',
          address: '56 Đường Nguyễn Văn Cừ, Cần Thơ',
          customerCode: 'KH0015',
          note: null,
          customerType: 'regular',
          createdAt: '2025-12-25T23:28:02.246Z',
          updatedAt: '2025-12-25T23:28:02.246Z',
        },
        transaction: {
          id: 'f9895600-6754-4d55-a46d-3202456eca87',
          totalAmount: 125.5,
          taxAmount: 0,
          finalAmount: 125.5,
          paymentMethod: 'cash',
          note: null,
          paidAmount: 0,
          changeAmount: 0,
          isCompleted: true,
          completedAt: null,
          createdAt: '2025-12-07T05:54:49.483Z',
          updatedAt: '2025-12-07T05:54:49.483Z',
        },
        totalRefundAmount: 112.75,
        status: 'completed',
        details: [
          {
            id: 'adeb280c-364f-4568-a056-80da977177ab',
            quantity: 1,
            type: 'exchange',
            refundAmount: 112.75,
            status: 'processed',
            reason: 'Prefer hardcover version',
            createdAt: '2026-01-03T05:54:49.483Z',
            updatedAt: '2026-01-03T05:54:49.483Z',
          },
        ],
        note: 'Exchange completed',
        createdAt: '2026-01-03T05:54:49.483Z',
        updatedAt: '2026-01-03T05:54:49.483Z',
      },
    ],
  })
  @Roles(UserRole.EMPLOYEE, UserRole.OWNER)
  @Get()
  async getReturnOrders(
    @BookStoreId() bookStoreId: string,
    @Query() getReturnOrdersQueryDto: GetReturnOrdersQueryDto,
  ) {
    return this.returnOrdersService.getReturnOrders(
      bookStoreId,
      getReturnOrdersQueryDto,
    );
  }

  @ApiOperation({
    summary: 'Xoá đơn trả/đổi hàng',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: {
      message: 'Đã xoá đơn trả/đổi hàng thành công.',
    },
  })
  @ApiParam({
    name: 'id',
    description: 'Id đơn trả/đổi hàng',
    example: '351c1480-ec86-4619-86a0-2e89a597e8c6',
  })
  @Roles(UserRole.EMPLOYEE, UserRole.OWNER)
  @Delete(':id')
  async deleteReturnOrder(
    @BookStoreId() bookStoreId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.returnOrdersService.deleteReturnOrder(bookStoreId, id);
  }

  private getBookStoreId(userSession: TUserSession) {
    const { bookStoreId } = userSession;
    if (!bookStoreId) {
      throw new BadRequestException('Missing bookStoreId in session.');
    }
    return bookStoreId;
  }

  @ApiOperation({ summary: 'Tạo yêu cầu trả/đổi hàng' })
  @ApiResponse({
    status: 201,
    description: 'Tạo mới thành công',
  })
  @ApiBody({ type: CreateReturnOrderDto })
  @Roles(UserRole.EMPLOYEE, UserRole.OWNER)
  @Post()
  createReturnOrder(
    @Body() dto: CreateReturnOrderDto,
    @UserSession() userSession: TUserSession,
  ) {
    return this.returnOrdersService.createReturnOrder(dto, userSession);
  }

  @ApiOperation({ summary: 'Lấy chi tiết yêu cầu trả/đổi hàng' })
  @ApiParam({
    name: 'id',
    description: 'ID của đơn trả/đổi',
    example: 'a2b4c6d8-1234-4abc-8def-123456789012',
  })
  @ApiResponse({
    status: 200,
    description: 'Thông tin đơn trả/đổi',
  })
  @Roles(UserRole.EMPLOYEE, UserRole.OWNER)
  @Get(':id')
  getReturnOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @UserSession() userSession: TUserSession,
  ) {
    return this.returnOrdersService.getReturnOrderById(
      id,
      this.getBookStoreId(userSession),
    );
  }

  @ApiOperation({ summary: 'Thêm chi tiết vào yêu cầu trả/đổi' })
  @ApiParam({
    name: 'id',
    description: 'ID của đơn trả/đổi',
    example: 'a2b4c6d8-1234-4abc-8def-123456789012',
  })
  @ApiResponse({
    status: 201,
    description: 'Thêm chi tiết thành công',
  })
  @ApiBody({ type: AddReturnOrderDetailDto })
  @Roles(UserRole.EMPLOYEE, UserRole.OWNER)
  @Post(':id/details')
  addDetail(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddReturnOrderDetailDto,
    @UserSession() userSession: TUserSession,
  ) {
    return this.returnOrdersService.addDetail(
      id,
      dto,
      this.getBookStoreId(userSession),
    );
  }

  @ApiOperation({ summary: 'Cập nhật chi tiết yêu cầu trả/đổi' })
  @ApiParam({
    name: 'id',
    description: 'ID của đơn trả/đổi',
    example: 'a2b4c6d8-1234-4abc-8def-123456789012',
  })
  @ApiParam({
    name: 'detailId',
    description: 'ID của chi tiết đơn trả/đổi',
    example: 'd2c4b6a8-5678-4cba-9fed-210987654321',
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật chi tiết thành công',
  })
  @ApiBody({ type: UpdateReturnOrderDetailDto })
  @Roles(UserRole.EMPLOYEE, UserRole.OWNER)
  @Patch(':id/details/:detailId')
  updateDetail(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('detailId', ParseUUIDPipe) detailId: string,
    @Body() dto: UpdateReturnOrderDetailDto,
    @UserSession() userSession: TUserSession,
  ) {
    return this.returnOrdersService.updateDetail(
      id,
      detailId,
      dto,
      this.getBookStoreId(userSession),
    );
  }

  @ApiOperation({ summary: 'Xoá chi tiết yêu cầu trả/đổi' })
  @ApiParam({
    name: 'id',
    description: 'ID của đơn trả/đổi',
    example: 'a2b4c6d8-1234-4abc-8def-123456789012',
  })
  @ApiParam({
    name: 'detailId',
    description: 'ID của chi tiết đơn trả/đổi',
    example: 'd2c4b6a8-5678-4cba-9fed-210987654321',
  })
  @ApiResponse({
    status: 200,
    description: 'Xoá chi tiết thành công',
  })
  @Roles(UserRole.EMPLOYEE, UserRole.OWNER)
  @Delete(':id/details/:detailId')
  deleteDetail(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('detailId', ParseUUIDPipe) detailId: string,
    @UserSession() userSession: TUserSession,
  ) {
    return this.returnOrdersService.deleteDetail(
      id,
      detailId,
      this.getBookStoreId(userSession),
    );
  }

  @ApiOperation({ summary: 'Tính lại tổng tiền hoàn' })
  @ApiParam({
    name: 'id',
    description: 'ID của đơn trả/đổi',
    example: 'a2b4c6d8-1234-4abc-8def-123456789012',
  })
  @ApiResponse({
    status: 200,
    description: 'Tổng tiền hoàn sau khi tính lại',
    example: {
      totalRefundAmount: 150000,
    },
  })
  @Roles(UserRole.EMPLOYEE, UserRole.OWNER)
  @Post(':id/recalculate')
  recalculate(
    @Param('id', ParseUUIDPipe) id: string,
    @UserSession() userSession: TUserSession,
  ) {
    return this.returnOrdersService.recalculateTotal(
      id,
      this.getBookStoreId(userSession),
    );
  }

  @ApiOperation({ summary: 'Từ chối yêu cầu trả/đổi' })
  @ApiBody({ type: RejectReturnOrderDto })
  @ApiParam({
    name: 'id',
    description: 'ID của đơn trả/đổi',
    example: 'a2b4c6d8-1234-4abc-8def-123456789012',
  })
  @ApiResponse({
    status: 200,
    description: 'Từ chối thành công',
  })
  @Roles(UserRole.EMPLOYEE, UserRole.OWNER)
  @Post(':id/reject')
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectReturnOrderDto,
    @UserSession() userSession: TUserSession,
  ) {
    return this.returnOrdersService.rejectReturnOrder(
      id,
      dto,
      this.getBookStoreId(userSession),
    );
  }

  @ApiOperation({ summary: 'Duyệt yêu cầu trả/đổi' })
  @ApiParam({
    name: 'id',
    description: 'ID của đơn trả/đổi',
    example: 'a2b4c6d8-1234-4abc-8def-123456789012',
  })
  @ApiResponse({
    status: 200,
    description: 'Duyệt thành công',
  })
  @Roles(UserRole.EMPLOYEE, UserRole.OWNER)
  @Post(':id/approve')
  approve(
    @Param('id', ParseUUIDPipe) id: string,
    @UserSession() userSession: TUserSession,
  ) {
    return this.returnOrdersService.approveReturnOrder(id, userSession);
  }
}
