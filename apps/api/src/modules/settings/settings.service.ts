import { MainBookStoreService } from '@/database/main/services/main-bookstore.service';
import { Shift, StoreSettings } from '@/database/tenant/entities';
import { TenantService } from '@/tenants/tenant.service';
import { Injectable, Logger } from '@nestjs/common';
import { UpdateSettingsDto } from './dto';
import { DataSource } from 'typeorm';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    private readonly tenantService: TenantService,
    private readonly mainBookStoreService: MainBookStoreService,
  ) {}

  // Default settings khi tạo mới - có thể lấy từ BookStore info
  private getDefaultSettings(bookStoreInfo?: {
    name?: string;
    address?: string;
    phoneNumber?: string;
  }): Partial<StoreSettings> {
    return {
      general: {
        storeName: bookStoreInfo?.name || '',
        slogan: '',
        address: bookStoreInfo?.address || '',
        phone: bookStoreInfo?.phoneNumber || '',
        email: '',
        website: '',
        facebook: '',
      },
      pos: {
        vatRate: 8,
        receiptFooter: 'Cảm ơn quý khách đã mua hàng!\nHẹn gặp lại!',
        wifiName: '',
        wifiPassword: '',
        enableCash: true,
        enableCard: true,
        enableBankTransfer: true,
        enableMomo: true,
        enableZaloPay: true,
        showLogoOnReceipt: true,
      },
      hr: {
        baseSalary: 4500000,
        hourlyRate: 25000,
        overtimeMultiplier: 1.5,
        latePenalty: 10000,
        standardWorkDays: 26,
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
    };
  }

  async getSettings(bookStoreId: string): Promise<StoreSettings> {
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const settingsRepo = dataSource.getRepository(StoreSettings);

    // Tìm record settings (chỉ có 1 row)
    let settings = await settingsRepo.findOne({ where: {} });

    // Nếu chưa có, tạo mới với default values
    if (!settings) {
      this.logger.log(`Creating default settings for bookstore ${bookStoreId}`);

      const defaultSettings = await this.buildDefaultSettings(
        bookStoreId,
        dataSource,
      );

      settings = settingsRepo.create(defaultSettings);
      settings = await settingsRepo.save(settings);

      this.logger.log(`Created settings for bookstore ${bookStoreId}`);
    } else {
      // Nếu đã có settings nhưng general.storeName rỗng => sync từ BookStore
      const needsSync =
        !settings.general?.storeName ||
        settings.general.storeName.trim() === '';

      if (needsSync) {
        this.logger.log(
          `[Settings] Syncing empty general info from BookStore for ${bookStoreId}`,
        );

        const bookStore = await this.mainBookStoreService.findBookStoreByField(
          'id',
          bookStoreId,
        );

        if (bookStore) {
          settings.general = {
            ...settings.general,
            storeName: bookStore.name || settings.general?.storeName || '',
            address: bookStore.address || settings.general?.address || '',
            phone: bookStore.phoneNumber || settings.general?.phone || '',
          };

          settings = await settingsRepo.save(settings);
          this.logger.log(
            `[Settings] Synced general info from BookStore: ${bookStore.name}`,
          );
        }
      }
    }

    return settings;
  }

  /**
   * Build default settings từ BookStore info và existing Shifts
   */
  private async buildDefaultSettings(
    bookStoreId: string,
    dataSource: DataSource,
  ): Promise<Partial<StoreSettings>> {
    // Lấy thông tin BookStore từ main database
    const bookStore = await this.mainBookStoreService.findBookStoreByField(
      'id',
      bookStoreId,
    );

    const defaultSettings = this.getDefaultSettings(
      bookStore
        ? {
            name: bookStore.name,
            address: bookStore.address,
            phoneNumber: bookStore.phoneNumber,
          }
        : undefined,
    );

    // Lấy Shift times hiện có từ database để sync
    const shiftRepo = dataSource.getRepository(Shift);
    const existingShifts = await shiftRepo.find();

    if (existingShifts.length > 0) {
      const morningShift = existingShifts.find((s) =>
        s.name.toLowerCase().includes('sáng'),
      );
      const afternoonShift = existingShifts.find((s) =>
        s.name.toLowerCase().includes('chiều'),
      );
      const eveningShift = existingShifts.find((s) =>
        s.name.toLowerCase().includes('tối'),
      );

      if (morningShift) {
        defaultSettings.hr!.morningShiftStart = morningShift.startTime;
        defaultSettings.hr!.morningShiftEnd = morningShift.endTime;
      }
      if (afternoonShift) {
        defaultSettings.hr!.afternoonShiftStart = afternoonShift.startTime;
        defaultSettings.hr!.afternoonShiftEnd = afternoonShift.endTime;
      }
      if (eveningShift) {
        defaultSettings.hr!.eveningShiftStart = eveningShift.startTime;
        defaultSettings.hr!.eveningShiftEnd = eveningShift.endTime;
      }

      this.logger.log(
        `[Settings] Synced HR shift times from ${existingShifts.length} existing shifts`,
      );
    }

    return defaultSettings;
  }

  async updateSettings(
    bookStoreId: string,
    updateSettingsDto: UpdateSettingsDto,
  ): Promise<StoreSettings> {
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const settingsRepo = dataSource.getRepository(StoreSettings);

    // Lấy settings hiện tại (hoặc tạo mới nếu chưa có)
    let settings = await this.getSettings(bookStoreId);

    // Merge từng section
    if (updateSettingsDto.general) {
      settings.general = {
        ...settings.general,
        ...updateSettingsDto.general,
      };
    }

    if (updateSettingsDto.pos) {
      settings.pos = {
        ...settings.pos,
        ...updateSettingsDto.pos,
      };
    }

    if (updateSettingsDto.hr) {
      settings.hr = {
        ...settings.hr,
        ...updateSettingsDto.hr,
      };

      // Sync shifts với settings mới
      await this.syncShiftsWithSettings(dataSource, settings.hr);
    }

    if (updateSettingsDto.inventory) {
      settings.inventory = {
        ...settings.inventory,
        ...updateSettingsDto.inventory,
      };
    }

    // Lưu
    settings = await settingsRepo.save(settings);

    this.logger.log(`Updated settings for bookstore ${bookStoreId}`);

    return settings;
  }

  /**
   * Sync các Shift trong database với thời gian từ Settings
   * Tạo mới nếu chưa có, cập nhật nếu đã tồn tại
   */
  private async syncShiftsWithSettings(
    dataSource: DataSource,
    hrSettings: StoreSettings['hr'],
  ): Promise<void> {
    const shiftRepo = dataSource.getRepository(Shift);

    // Định nghĩa các ca mặc định cần sync
    const defaultShifts = [
      {
        name: 'Ca Sáng',
        startTime: hrSettings.morningShiftStart || '07:30',
        endTime: hrSettings.morningShiftEnd || '12:00',
        description: 'Ca làm việc buổi sáng',
      },
      {
        name: 'Ca Chiều',
        startTime: hrSettings.afternoonShiftStart || '13:00',
        endTime: hrSettings.afternoonShiftEnd || '17:30',
        description: 'Ca làm việc buổi chiều',
      },
      {
        name: 'Ca Tối',
        startTime: hrSettings.eveningShiftStart || '17:30',
        endTime: hrSettings.eveningShiftEnd || '21:30',
        description: 'Ca làm việc buổi tối',
      },
      {
        name: 'Ca Cả Ngày',
        startTime: hrSettings.morningShiftStart || '07:30',
        endTime: hrSettings.eveningShiftEnd || '21:30',
        description: 'Ca làm việc cả ngày',
      },
    ];

    for (const shiftData of defaultShifts) {
      // Tìm shift theo tên
      let existingShift = await shiftRepo.findOne({
        where: { name: shiftData.name },
      });

      if (existingShift) {
        // Cập nhật thời gian
        existingShift.startTime = shiftData.startTime;
        existingShift.endTime = shiftData.endTime;
        await shiftRepo.save(existingShift);
        this.logger.log(`[SyncShifts] Updated shift: ${shiftData.name}`);
      } else {
        // Tạo mới shift
        const newShift = shiftRepo.create(shiftData);
        await shiftRepo.save(newShift);
        this.logger.log(`[SyncShifts] Created shift: ${shiftData.name}`);
      }
    }

    this.logger.log('[SyncShifts] Shifts synchronized with settings');
  }

  /**
   * Lấy thời gian các ca làm việc từ settings
   * API endpoint riêng để frontend có thể fetch shift times
   */
  async getShiftTimes(bookStoreId: string) {
    const settings = await this.getSettings(bookStoreId);
    const hr = settings.hr;

    return {
      morning: {
        name: 'Ca Sáng',
        startTime: hr.morningShiftStart || '07:30',
        endTime: hr.morningShiftEnd || '12:00',
      },
      afternoon: {
        name: 'Ca Chiều',
        startTime: hr.afternoonShiftStart || '13:00',
        endTime: hr.afternoonShiftEnd || '17:30',
      },
      evening: {
        name: 'Ca Tối',
        startTime: hr.eveningShiftStart || '17:30',
        endTime: hr.eveningShiftEnd || '21:30',
      },
      fullDay: {
        name: 'Ca Cả Ngày',
        startTime: hr.morningShiftStart || '07:30',
        endTime: hr.eveningShiftEnd || '21:30',
      },
    };
  }
}
