import { BookStoreId, Roles, UserSession } from '@/common/decorators';
import {
  AddDetailToTransactionDto,
  CreateTransactionDto,
  GetTransactionsQueryDto,
  UpdateTransactionDetailDto,
  UpdateTransactionDto,
} from '@/common/dtos';
import { TUserSession } from '@/common/utils';
import { UserRole } from '@/modules/users/enums';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
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
import { TransactionsService } from './transactions.service';

@Controller('transactions')
@ApiTags('Hoá đơn mua hàng')
@ApiBearerAuth()
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @ApiOperation({
    summary: 'Tạo mới hoá đơn giao dịch',
    description:
      'Đường dẫn này dùng để tạo mới hoá đơn giao dịch, chỉ có NHÂN VIÊN mới có quyền thực hiện.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Dữ liệu trả về.',
    example: {},
  })
  @ApiBody({
    type: CreateTransactionDto,
  })
  @Roles(UserRole.EMPLOYEE)
  @Post()
  async createTransaction(
    @Body() createTransactionDto: CreateTransactionDto,
    @UserSession() userSession: TUserSession,
  ) {
    return this.transactionsService.createTransaction(
      createTransactionDto,
      userSession,
    );
  }

  @ApiOperation({
    summary: 'Cập nhật hoá đơn mua hàng',
    description:
      'Đường dẫn này dùng để cập nhật hoá đơn mua hàng, chỉ có NHÂN VIÊN mới có quyền thực hiện.',
  })
  @ApiParam({
    name: 'id',
    description: 'Mã ID của đơn mua hàng',
    example: 'uuid-1',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Dữ liệu trả về',
    example: {},
  })
  @Roles(UserRole.EMPLOYEE)
  @Patch(':id')
  async updateTransaction(
    @Body() updateTransactionDto: UpdateTransactionDto,
    @UserSession() userSession: TUserSession,
    @Param('id', ParseUUIDPipe) transactionId: string,
  ) {
    return this.transactionsService.updateTransaction(
      transactionId,
      userSession,
      updateTransactionDto,
    );
  }

  @ApiOperation({
    summary: 'Cập nhật các chi tiết trong đơn mua hàng',
    description:
      'Đường dẫn này dùng để cập nhật các chi tiết trong đơn mua hàng, chỉ có NHÂN VIÊN mới có quyền thực hiện hành động này.',
  })
  @ApiParam({
    name: 'id',
    description: 'Mã ID của đơn hàng',
    example: 'uuid-1',
  })
  @ApiParam({
    name: 'transactionDetailId',
    description: 'Mã ID của chi tiết trong đơn mua hàng',
    example: 'uuid-2',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Dữ liệu trả về',
    example: {},
  })
  @Roles(UserRole.EMPLOYEE)
  @Patch(':id/details/:transactionDetailId')
  async updateTransactionDetail(
    @Param('id', ParseUUIDPipe) transactionId: string,
    @Param('transactionDetailId', ParseUUIDPipe) transactionDetailId: string,
    @Body() updateTransactionDetailDto: UpdateTransactionDetailDto,
    @UserSession() userSession: TUserSession,
  ) {
    return this.transactionsService.updateTransactionDetail(
      transactionId,
      transactionDetailId,
      userSession,
      updateTransactionDetailDto,
    );
  }

  @ApiOperation({
    summary: 'Thêm chi tiết hoá đơn vào hoá đơn',
    description:
      'Đường dẫn này dùng để thêm chi tiết hoá đơn vào hoá đơn, chỉ có NHÂN VIÊN mới có quyền thực hiện.',
  })
  @Roles(UserRole.EMPLOYEE)
  @Post(':id/details')
  async addDetailToTransaction(
    @Body() addDetailToTransactionDto: AddDetailToTransactionDto,
    @Param('id', ParseUUIDPipe) transactionId: string,
    @UserSession() userSession: TUserSession,
  ) {
    return this.transactionsService.addDetailToTransaction(
      transactionId,
      userSession,
      addDetailToTransactionDto,
    );
  }

  @ApiOperation({
    summary: 'Lấy danh sách hoá đơn',
    description:
      'Đường dẫn này dùng để lấy danh sách hoá đơn (có lọc), cho phép cả CHỦ hoặc NHÂN VIÊN cửa hàng có quyền thực hiện.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: {},
  })
  @Roles(UserRole.EMPLOYEE, UserRole.OWNER)
  @Get()
  async getTransactions(
    @Query() getTransactionsQueryDto: GetTransactionsQueryDto,
    @BookStoreId() bookStoreId: string,
  ) {
    return this.transactionsService.getTransactions(
      getTransactionsQueryDto,
      bookStoreId,
    );
  }

  @ApiOperation({
    summary: 'Lấy chi tiết hoá đơn',
    description:
      'Đường dẫn này dùng để lấy chi tiết hoá đơn, cho phép cả NHÂN VIÊN và CHỦ nhà sách thực hiện.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID của hoá đơn',
    example: 'id-1',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: {},
  })
  @Get(':id')
  async getTransaction(
    @Param('id', ParseUUIDPipe) id: string,
    @BookStoreId() bookStoreId: string,
  ) {
    return this.transactionsService.getTransaction(id, bookStoreId);
  }
}
