import { decryptPayload } from '@/common/utils/helpers';
import { MainBookStoreService } from '@/database/main/services/main-bookstore.service';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);
  private readonly connections = new Map<string, DataSource>();

  constructor(
    private readonly configService: ConfigService,
    private readonly mainBookStoreService: MainBookStoreService,
  ) {}

  async getTenantConnection(params: {
    bookStoreId?: string;
    storeCode?: string;
  }): Promise<DataSource> {
    const { bookStoreId, storeCode } = params;

    if (!bookStoreId?.trim() && !storeCode?.trim()) {
      throw new BadRequestException(
        'Either tenantId or storeCode must be provided.',
      );
    }

    if (bookStoreId && this.connections.has(bookStoreId)) {
      return this.connections.get(bookStoreId)!;
    }

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

    if (this.connections.has(bookStoreData.id)) {
      return this.connections.get(bookStoreData.id)!;
    }

    const options: DataSourceOptions = {
      type: bookStoreData.connection.type as any,
      host: bookStoreData.connection.host,
      port: bookStoreData.connection.port,
      username: bookStoreData.connection.username,
      password: decryptPayload(
        bookStoreData.connection.password,
        this.configService,
      ),
      database: bookStoreData.connection.database,
      entities: [join(__dirname, '../database/tenant/entities/**/*{.ts,.js}')],
      synchronize: true,
      namingStrategy: new SnakeNamingStrategy(),
    };

    const dataSource = new DataSource(options);
    await dataSource.initialize();

    this.logger.log(
      `Connected to database: ${bookStoreData.id} (${bookStoreData.code || 'no code'})`,
    );
    this.connections.set(bookStoreData.id, dataSource);

    return dataSource;
  }
}
