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
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles, UserSession } from '@/common/decorators';
import { TUserSession } from '@/common/utils';

@Controller('return-orders')
@ApiTags('Đơn trả/đổi hàng')
@ApiBearerAuth()
export class ReturnOrdersController {
  constructor(private readonly returnOrdersService: ReturnOrdersService) {}

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
