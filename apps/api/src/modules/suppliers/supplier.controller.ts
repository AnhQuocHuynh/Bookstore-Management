import { BookStoreId, Roles } from '@/common/decorators';
import { CreateSupplierDto, UpdateSupplierDto } from '@/modules/suppliers/dto';
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
} from '@nestjs/common';
import { SupplierService } from './supplier.service';

@Controller('suppliers')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Get()
  async getSuppliers(@BookStoreId() bookStoreId: string) {
    return this.supplierService.getSuppliers(bookStoreId);
  }

  @Post()
  @Roles(UserRole.OWNER)
  async createSupplier(
    @Body() createSupplierDto: CreateSupplierDto,
    @BookStoreId() bookStoreId: string,
  ) {
    return this.supplierService.createSupplier(createSupplierDto, bookStoreId);
  }

  @Get(':id')
  async getSupplierById(
    @Param('id', ParseUUIDPipe) id: string,
    @BookStoreId() bookStoreId: string,
  ) {
    return this.supplierService.getSupplierById(id, bookStoreId);
  }

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

  @Delete(':id')
  @Roles(UserRole.OWNER)
  async deleteSupplierById(
    @Param('id', ParseUUIDPipe) id: string,
    @BookStoreId() bookStoreId: string,
  ) {
    return this.supplierService.deleteSupplierById(id, bookStoreId);
  }
}
