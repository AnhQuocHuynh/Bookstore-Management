import { BookStoreId, Roles } from '@/common/decorators';
import { CreateSupplierDto, UpdateSupplierDto } from '@/modules/suppliers/dto';
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
import { SupplierService } from './supplier.service';

@Controller('suppliers')
@ApiTags('SupplierController')
@ApiBearerAuth()
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @ApiOperation({
    summary: 'Lấy danh sách nhà cung cấp',
    description: 'Đường dẫn này dùng để lấy danh sách nhà cung cấp.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: [
      {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        name: 'Nhà cung cấp ABC',
        email: 'supplier@example.com',
        phoneNumber: '0393877632',
        address: 'Hồ Chí Minh',
        taxCode: '1234567890',
        contactPerson: 'Nguyễn Văn A',
        note: 'Nhà cung cấp uy tín',
        createdAt: '2025-12-08T10:00:00.000Z',
        updatedAt: '2025-12-08T10:00:00.000Z',
      },
    ],
  })
  @Get()
  async getSuppliers(@BookStoreId() bookStoreId: string) {
    return this.supplierService.getSuppliers(bookStoreId);
  }

  @ApiOperation({
    summary: 'Tạo mới nhà cung cấp',
    description:
      'Đường dẫn này dùng để tạo mới nhà cung cấp, chỉ có OWNER mới có quyền thực hiện hành động này.',
  })
  @ApiBody({
    type: CreateSupplierDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    example: {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      name: 'Nhà cung cấp ABC',
      email: 'supplier@example.com',
      phoneNumber: '0393877632',
      address: 'Hồ Chí Minh',
      taxCode: '1234567890',
      contactPerson: 'Nguyễn Văn A',
      note: 'Nhà cung cấp uy tín',
      createdAt: '2025-12-08T10:00:00.000Z',
      updatedAt: '2025-12-08T10:00:00.000Z',
    },
  })
  @Post()
  @Roles(UserRole.OWNER)
  async createSupplier(
    @Body() createSupplierDto: CreateSupplierDto,
    @BookStoreId() bookStoreId: string,
  ) {
    return this.supplierService.createSupplier(createSupplierDto, bookStoreId);
  }

  @ApiOperation({
    summary: 'Lấy thông tin chi tiết nhà cung cấp',
    description:
      'Đường dẫn này dùng để lấy thông tin chi tiết của một nhà cung cấp.',
  })
  @ApiParam({
    name: 'id',
    description: 'Id của nhà cung cấp',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      name: 'Nhà cung cấp ABC',
      email: 'supplier@example.com',
      phoneNumber: '0393877632',
      address: 'Hồ Chí Minh',
      taxCode: '1234567890',
      contactPerson: 'Nguyễn Văn A',
      note: 'Nhà cung cấp uy tín',
      createdAt: '2025-12-08T10:00:00.000Z',
      updatedAt: '2025-12-08T10:00:00.000Z',
    },
  })
  @Get(':id')
  async getSupplierById(
    @Param('id', ParseUUIDPipe) id: string,
    @BookStoreId() bookStoreId: string,
  ) {
    return this.supplierService.getSupplierById(id, bookStoreId);
  }

  @ApiOperation({
    summary: 'Cập nhật thông tin nhà cung cấp',
    description:
      'Đường dẫn này dùng để cập nhật thông tin nhà cung cấp, chỉ có OWNER mới có quyền thực hiện hành động này.',
  })
  @ApiParam({
    name: 'id',
    description: 'Id của nhà cung cấp',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiBody({
    type: UpdateSupplierDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      name: 'Nhà cung cấp XYZ',
      email: 'supplier@example.com',
      phoneNumber: '0393877632',
      address: 'Hà Nội',
      taxCode: '1234567890',
      contactPerson: 'Nguyễn Văn B',
      note: 'Nhà cung cấp uy tín',
      createdAt: '2025-12-08T10:00:00.000Z',
      updatedAt: '2025-12-08T11:00:00.000Z',
    },
  })
  @Patch(':id')
  @Roles(UserRole.OWNER)
  async updateSupplierById(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
    @BookStoreId() bookStoreId: string,
  ) {
    return this.supplierService.updateSupplierById(
      id,
      updateSupplierDto,
      bookStoreId,
    );
  }

  @ApiOperation({
    summary: 'Xóa nhà cung cấp',
    description:
      'Đường dẫn này dùng để xóa nhà cung cấp, chỉ có OWNER mới có quyền thực hiện hành động này.',
  })
  @ApiParam({
    name: 'id',
    description: 'Id của nhà cung cấp',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: [
      {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        name: 'Nhà cung cấp ABC',
        email: 'supplier@example.com',
        phoneNumber: '0393877632',
        address: 'Hồ Chí Minh',
        taxCode: '1234567890',
        contactPerson: 'Nguyễn Văn A',
        note: 'Nhà cung cấp uy tín',
        createdAt: '2025-12-08T10:00:00.000Z',
        updatedAt: '2025-12-08T10:00:00.000Z',
      },
    ],
  })
  @Delete(':id')
  @Roles(UserRole.OWNER)
  async deleteSupplierById(
    @Param('id', ParseUUIDPipe) id: string,
    @BookStoreId() bookStoreId: string,
  ) {
    return this.supplierService.deleteSupplierById(id, bookStoreId);
  }
}
