import { CloudinaryModule } from '@kaidenki/nestjs-cloudinary';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

@Module({
  imports: [
    CloudinaryModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        cloud_name: configService.get<string>('cloudinary.cloud_name', ''),
        api_key: configService.get<string>('cloudinary.api_key', ''),
        api_secret: configService.get<string>('cloudinary.api_secret', ''),
      }),
    }),
  ],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
