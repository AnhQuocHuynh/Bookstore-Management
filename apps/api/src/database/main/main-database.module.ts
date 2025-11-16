import {
  AuthorizationCode,
  BookStore,
  DatabaseConnection,
  Otp,
  RefreshToken,
  User,
} from '@/database/main/entities';
import { MainAuthorizationCodeService } from '@/database/main/services/main-authorization-code.service';
import { MainBookStoreService } from '@/database/main/services/main-bookstore.service';
import { MainDatabaseConnectionService } from '@/database/main/services/main-database-connection.service';
import { MainOtpService } from '@/database/main/services/main-otp.service';
import { MainRefreshTokenService } from '@/database/main/services/main-refresh-token.service';
import { MainUserService } from '@/database/main/services/main-user.service';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host', 'localhost'),
        port: configService.get<number>('database.port', 5432),
        username: configService.get<string>('database.username', 'user'),
        password: configService.get<string>('database.password', 'password'),
        database: configService.get<string>('database.name', 'name'),
        entities: [
          join(__dirname, '../../database/main/entities/**/*{.ts,.js}'),
        ],
        synchronize: false,
        migrations: ['dist/database/migrations/*.js'],
        logging: false,
        namingStrategy: new SnakeNamingStrategy(),
      }),
    }),
    TypeOrmModule.forFeature([
      BookStore,
      User,
      Otp,
      RefreshToken,
      AuthorizationCode,
      DatabaseConnection,
    ]),
  ],
  providers: [
    MainUserService,
    MainBookStoreService,
    MainDatabaseConnectionService,
    MainOtpService,
    MainRefreshTokenService,
    MainAuthorizationCodeService,
  ],
  exports: [
    MainUserService,
    MainBookStoreService,
    MainDatabaseConnectionService,
    MainOtpService,
    MainRefreshTokenService,
    MainAuthorizationCodeService,
    TypeOrmModule,
  ],
})
export class MainDatabaseModule {}
