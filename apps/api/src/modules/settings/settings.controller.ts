import { BookStoreId } from '@/common/decorators';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateSettingsDto } from './dto';
import { SettingsService } from './settings.service';

@Controller('settings')
@ApiTags('Cài đặt cửa hàng')
@ApiBearerAuth()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @ApiOperation({
    summary: 'Lấy cài đặt cửa hàng',
    description:
      'Lấy toàn bộ cài đặt của cửa hàng. Nếu chưa có sẽ tự động tạo với giá trị mặc định.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: {
      id: 'uuid',
      general: {
        storeName: 'Nhà Sách Ánh Dương',
        slogan: 'Khơi nguồn tri thức',
        address: '123 Nguyễn Văn Cừ, Q5, TP.HCM',
        phone: '0909123456',
        email: 'contact@bookstore.com',
      },
      pos: {
        vatRate: 8,
        receiptFooter: 'Cảm ơn quý khách!',
        enableCash: true,
        enableCard: true,
        enableBankTransfer: true,
        enableMomo: true,
        enableZaloPay: true,
      },
      hr: {
        baseSalary: 4500000,
        morningShiftStart: '07:30',
        morningShiftEnd: '12:00',
        afternoonShiftStart: '13:00',
        afternoonShiftEnd: '17:30',
        eveningShiftStart: '17:30',
        eveningShiftEnd: '21:30',
      },
      inventory: {
        lowStockThreshold: 10,
        autoReorder: false,
        enableEmailAlert: true,
      },
      createdAt: '2025-01-19T10:00:00.000Z',
      updatedAt: '2025-01-19T10:00:00.000Z',
    },
  })
  @Get()
  async getSettings(@BookStoreId() bookStoreId: string) {
    return this.settingsService.getSettings(bookStoreId);
  }

  @ApiOperation({
    summary: 'Cập nhật cài đặt cửa hàng',
    description: 'Cập nhật một phần hoặc toàn bộ cài đặt. Hỗ trợ partial update.',
  })
  @ApiBody({ type: UpdateSettingsDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật thành công',
  })
  @Patch()
  async updateSettings(
    @BookStoreId() bookStoreId: string,
    @Body() updateSettingsDto: UpdateSettingsDto,
  ) {
    return this.settingsService.updateSettings(bookStoreId, updateSettingsDto);
  }
}
