import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class GeneralSettingsDto {
  @ApiPropertyOptional({ description: 'Tên cửa hàng', example: 'Nhà Sách Ánh Dương' })
  @IsOptional()
  @IsString()
  storeName?: string;

  @ApiPropertyOptional({ description: 'Slogan', example: 'Khơi nguồn tri thức' })
  @IsOptional()
  @IsString()
  slogan?: string;

  @ApiPropertyOptional({ description: 'Địa chỉ', example: '123 Nguyễn Văn Cừ, Q5, TP.HCM' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại', example: '0909123456' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Email', example: 'contact@bookstore.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Website', example: 'https://bookstore.com' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({ description: 'Facebook', example: 'https://facebook.com/bookstore' })
  @IsOptional()
  @IsString()
  facebook?: string;
}

export class PosSettingsDto {
  @ApiPropertyOptional({ description: 'Thuế VAT (%)', example: 8 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  vatRate?: number;

  @ApiPropertyOptional({ description: 'Chân trang hóa đơn', example: 'Cảm ơn quý khách!' })
  @IsOptional()
  @IsString()
  receiptFooter?: string;

  @ApiPropertyOptional({ description: 'Tên WiFi', example: 'BookStore_Free_Wifi' })
  @IsOptional()
  @IsString()
  wifiName?: string;

  @ApiPropertyOptional({ description: 'Mật khẩu WiFi', example: 'docsachvuihe' })
  @IsOptional()
  @IsString()
  wifiPassword?: string;

  @ApiPropertyOptional({ description: 'Cho phép thanh toán tiền mặt', example: true })
  @IsOptional()
  @IsBoolean()
  enableCash?: boolean;

  @ApiPropertyOptional({ description: 'Cho phép thanh toán thẻ', example: true })
  @IsOptional()
  @IsBoolean()
  enableCard?: boolean;

  @ApiPropertyOptional({ description: 'Cho phép chuyển khoản', example: true })
  @IsOptional()
  @IsBoolean()
  enableBankTransfer?: boolean;

  @ApiPropertyOptional({ description: 'Cho phép MoMo', example: true })
  @IsOptional()
  @IsBoolean()
  enableMomo?: boolean;

  @ApiPropertyOptional({ description: 'Cho phép ZaloPay', example: true })
  @IsOptional()
  @IsBoolean()
  enableZaloPay?: boolean;

  @ApiPropertyOptional({ description: 'Hiển thị logo trên hóa đơn', example: true })
  @IsOptional()
  @IsBoolean()
  showLogoOnReceipt?: boolean;
}

export class HrSettingsDto {
  @ApiPropertyOptional({ description: 'Lương cơ bản (VNĐ/tháng)', example: 4500000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  baseSalary?: number;

  @ApiPropertyOptional({ description: 'Lương theo giờ (VNĐ)', example: 25000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRate?: number;

  @ApiPropertyOptional({ description: 'Hệ số làm thêm giờ', example: 1.5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  overtimeMultiplier?: number;

  @ApiPropertyOptional({ description: 'Phạt đi trễ (VNĐ)', example: 10000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  latePenalty?: number;

  @ApiPropertyOptional({ description: 'Số ngày làm việc tiêu chuẩn', example: 26 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(31)
  standardWorkDays?: number;
}

export class InventorySettingsDto {
  @ApiPropertyOptional({ description: 'Ngưỡng tồn kho thấp', example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lowStockThreshold?: number;

  @ApiPropertyOptional({ description: 'Tự động đặt hàng lại', example: false })
  @IsOptional()
  @IsBoolean()
  autoReorder?: boolean;

  @ApiPropertyOptional({ description: 'Gửi email cảnh báo', example: true })
  @IsOptional()
  @IsBoolean()
  enableEmailAlert?: boolean;
}

export class UpdateSettingsDto {
  @ApiPropertyOptional({ type: GeneralSettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => GeneralSettingsDto)
  general?: GeneralSettingsDto;

  @ApiPropertyOptional({ type: PosSettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PosSettingsDto)
  pos?: PosSettingsDto;

  @ApiPropertyOptional({ type: HrSettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => HrSettingsDto)
  hr?: HrSettingsDto;

  @ApiPropertyOptional({ type: InventorySettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => InventorySettingsDto)
  inventory?: InventorySettingsDto;
}
