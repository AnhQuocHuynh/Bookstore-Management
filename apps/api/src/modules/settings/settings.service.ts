import { MainBookStoreService } from '@/database/main/services/main-bookstore.service';
import { StoreSettings } from '@/database/tenant/entities';
import { TenantService } from '@/tenants/tenant.service';
import { Injectable, Logger } from '@nestjs/common';
import { UpdateSettingsDto } from './dto';

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

      const defaultSettings = await this.buildDefaultSettings(bookStoreId);

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
   * Build default settings từ BookStore info
   */
  private async buildDefaultSettings(
    bookStoreId: string,
  ): Promise<Partial<StoreSettings>> {
    // Lấy thông tin BookStore từ main database
    const bookStore = await this.mainBookStoreService.findBookStoreByField(
      'id',
      bookStoreId,
    );

    return this.getDefaultSettings(
      bookStore
        ? {
            name: bookStore.name,
            address: bookStore.address,
            phoneNumber: bookStore.phoneNumber,
          }
        : undefined,
    );
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
}
