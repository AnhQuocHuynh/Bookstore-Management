import envConfig from '@/config/env.config';
import { MainDatabaseModule } from '@/database/main/main-database.module';
import { TenantDatabaseModule } from '@/database/tenant/tenant-database.module';
import { AdminModule } from '@/modules/admin/admin.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { BookStoreModule } from '@/modules/bookstore/bookstore.module';
import { DisplayModule } from '@/modules/display/display.module';
import { EmailModule } from '@/modules/email/email.module';
import { FilesModule } from '@/modules/files/files.module';
import { InventoriesModule } from '@/modules/inventories/inventories.module';
import { SupplierModule } from '@/modules/suppliers/supplier.module';
import { UserModule } from '@/modules/users/user.module';
import { TenantModule } from '@/tenants/tenant.module';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { BooksModule } from './modules/books/books.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { PublishersModule } from './modules/publishers/publishers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig],
    }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt_secret', ''),
        signOptions: {
          expiresIn: configService.get('jwt_expiration_time', '120s'),
        },
      }),
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          url: configService.get<string>('bullmq_connection_url', ''),
        },
      }),
    }),
    TenantModule,
    TenantDatabaseModule,
    MainDatabaseModule,
    AuthModule,
    AdminModule,
    EmailModule,
    UserModule,
    SupplierModule,
    PublishersModule,
    BookStoreModule,
    FilesModule,
    BooksModule,
    CategoriesModule,
    DisplayModule,
    InventoriesModule,
  ],
})
export class AppModule {}
