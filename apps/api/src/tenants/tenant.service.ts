import { InjectRedisClient } from '@/common/decorators';
import { NotificationType } from '@/common/enums';
import { RawTenantConfig, RedisClient } from '@/common/utils';
import { decryptPayload } from '@/common/utils/helpers';
import { MainBookStoreService } from '@/database/main/services/main-bookstore.service';
import { Notification } from '@/database/tenant/entities';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { DataSource, DataSourceOptions, In } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

@Injectable()
export class TenantService implements OnModuleDestroy {
  private readonly logger = new Logger(TenantService.name);
  private readonly dataSourceMap = new Map<string, DataSource>();
  private readonly initPromises = new Map<string, Promise<DataSource>>();
  private readonly configTtlSeconds: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly mainBookStoreService: MainBookStoreService,
    @InjectRedisClient() private readonly redisClient: RedisClient,
  ) {
    this.configTtlSeconds =
      Number(this.configService.get<number>('tenant_config_ttl_second')) ||
      3600;
  }

  async getTenantConnection(params: {
    bookStoreId?: string;
    storeCode?: string;
  }): Promise<DataSource> {
    const { bookStoreId, storeCode } = params;

    if (!bookStoreId?.trim() && !storeCode?.trim()) {
      throw new BadRequestException(
        'Phải cung cấp một trong hai: bookStoreId hoặc storeCode.',
      );
    }

    const tenantKey = bookStoreId || storeCode!;
    const existing = this.dataSourceMap.get(tenantKey);
    if (existing && existing.isInitialized) {
      return existing;
    }

    if (this.initPromises.has(tenantKey)) {
      this.logger.log(
        `Awaiting ongoing initialization for tenant ${tenantKey}`,
      );
      return this.initPromises.get(tenantKey)!;
    }

    const initPromise = this.initializeTenantDataSource(tenantKey, {
      bookStoreId,
      storeCode,
    }).finally(() => {
      this.initPromises.delete(tenantKey);
    });

    this.initPromises.set(tenantKey, initPromise);

    return initPromise;
  }

  private async initializeTenantDataSource(
    tenantKey: string,
    params: { bookStoreId?: string; storeCode?: string },
  ): Promise<DataSource> {
    const redisKey = `tenant_connection_config:${tenantKey}`;
    let rawJson: string | null = null;

    try {
      rawJson = await this.redisClient.get(redisKey);
    } catch (err) {
      this.logger.warn(`Redis GET failed for ${redisKey}: ${err}`);
      rawJson = null;
    }

    let rawConfig: RawTenantConfig | null = null;

    if (rawJson) {
      try {
        rawConfig = JSON.parse(rawJson) as RawTenantConfig;
        this.logger.log(`Using Redis cached config for tenant: ${tenantKey}`);
      } catch (err) {
        this.logger.warn(
          `Failed to parse cached config for ${tenantKey}: ${err}`,
        );
        rawConfig = null;
      }
    }

    if (!rawConfig) {
      const { bookStoreId, storeCode } = params;
      const bookStoreData = bookStoreId
        ? await this.mainBookStoreService.findBookStoreByField(
            'id',
            bookStoreId,
            {
              connection: true,
            },
          )
        : await this.mainBookStoreService.findBookStoreByField(
            'code',
            storeCode!,
            {
              connection: true,
            },
          );

      if (!bookStoreData) {
        throw new NotFoundException('BookStore not found.');
      }

      rawConfig = {
        type: bookStoreData.connection.type,
        host: bookStoreData.connection.host,
        port: bookStoreData.connection.port,
        username: bookStoreData.connection.username,
        password: decryptPayload(
          bookStoreData.connection.password,
          this.configService,
        ),
        database: bookStoreData.connection.database,
      };

      try {
        await this.redisClient.set(
          redisKey,
          JSON.stringify(rawConfig),
          'EX',
          this.configTtlSeconds,
        );
        this.logger.log(`Cached tenant config in Redis: ${tenantKey}`);
      } catch (err) {
        this.logger.warn(`Redis SET failed for ${redisKey}: ${err}`);
      }
    }

    const options: DataSourceOptions = {
      type: rawConfig!.type as any,
      host: rawConfig!.host,
      port: rawConfig!.port,
      username: rawConfig!.username,
      password: rawConfig!.password,
      database: rawConfig!.database,
      entities: [join(__dirname, '../database/tenant/entities/**/*{.ts,.js}')],
      synchronize: false,
      namingStrategy: new SnakeNamingStrategy(),
    };

    const existing = this.dataSourceMap.get(tenantKey);
    if (existing && existing.isInitialized) {
      return existing;
    }

    const ds = new DataSource(options);

    try {
      await ds.initialize();
      this.logger.log(`Connected to tenant DB: ${tenantKey}`);

      await this.seedNotificationTemplates(ds);
    } catch (err) {
      this.logger.error(
        `Failed to initialize DataSource for ${tenantKey}: ${err}`,
      );
      try {
        if (ds.isInitialized) {
          await ds.destroy();
        }
      } catch (destroyErr) {
        this.logger.warn(
          `Error destroying failed DataSource for ${tenantKey}: ${destroyErr}`,
        );
      }
      throw err;
    }

    this.dataSourceMap.set(tenantKey, ds);

    return ds;
  }

  async invalidateTenant(tenantKey: string): Promise<void> {
    const redisKey = `tenant_connection_config:${tenantKey}`;

    try {
      await this.redisClient.del(redisKey);
      this.logger.log(`Deleted Redis cached config for ${tenantKey}`);
    } catch (err) {
      this.logger.warn(`Redis DEL failed for ${redisKey}: ${err}`);
    }

    const ds = this.dataSourceMap.get(tenantKey);
    if (ds) {
      try {
        if (ds.isInitialized) {
          await ds.destroy();
        }
      } catch (err) {
        this.logger.warn(
          `Failed to destroy DataSource for ${tenantKey}: ${err}`,
        );
      } finally {
        this.dataSourceMap.delete(tenantKey);
      }
    }
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log('Shutting down tenant connections...');
    const destroys: Promise<void>[] = [];
    for (const [key, ds] of this.dataSourceMap.entries()) {
      destroys.push(
        (async () => {
          try {
            if (ds.isInitialized) {
              await ds.destroy();
              this.logger.log(`Destroyed DataSource for tenant ${key}`);
            }
          } catch (err) {
            this.logger.warn(`Error destroying DataSource for ${key}: ${err}`);
          }
        })(),
      );
    }
    await Promise.all(destroys);
    this.logger.log('All tenant DataSources destroyed.');
  }

  private async seedNotificationTemplates(
    dataSource: DataSource,
  ): Promise<void> {
    await dataSource.transaction(async (manager) => {
      const notificationRepo = manager.getRepository(Notification);

      const templates: { type: NotificationType; title: string }[] = [
        // Account & Role
        { type: NotificationType.ACCOUNT_CREATED, title: 'Tạo tài khoản' },
        {
          type: NotificationType.ROLE_CHANGED,
          title: 'Thay đổi quyền nhân viên',
        },
        { type: NotificationType.EMPLOYEE_ADDED, title: 'Thêm nhân viên mới' },

        // System
        { type: NotificationType.SYSTEM_ALERT, title: 'Cảnh báo hệ thống' },
        {
          type: NotificationType.GENERAL_ANNOUNCEMENT,
          title: 'Thông báo chung',
        },

        // Workforce
        { type: NotificationType.SHIFT_ASSIGNED, title: 'Phân ca làm việc' },

        // Inventory & Supplier
        {
          type: NotificationType.PURCHASE_ORDER_CREATED,
          title: 'Tạo đơn mua nhà cung cấp',
        },
        { type: NotificationType.ITEM_RECEIVED, title: 'Nhập kho sản phẩm' },
        { type: NotificationType.ITEM_UPDATED, title: 'Điều chỉnh tồn kho' },
        { type: NotificationType.STOCK_LOW, title: 'Cảnh báo tồn kho thấp' },
        { type: NotificationType.ITEM_OUT_OF_STOCK, title: 'Hết hàng' },

        // Customer
        { type: NotificationType.RETURN_REQUEST, title: 'Yêu cầu trả / đổi' },
      ];

      const existing = await notificationRepo.find({
        select: ['type'],
        where: {
          type: In(templates.map((t) => t.type)),
        },
      });

      const existingTypes = new Set(existing.map((n) => n.type));

      const missing = templates.filter((t) => !existingTypes.has(t.type));

      if (!missing.length) {
        this.logger.log(
          `[NotificationSeed] All notification templates already exist`,
        );
        return;
      }

      const entities = notificationRepo.create(missing);

      await notificationRepo.save(entities);

      this.logger.log(
        `[NotificationSeed] Inserted ${entities.length} notification templates`,
      );
    });
  }
}
