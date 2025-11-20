import { encryptPayload } from '@/common/utils';
import { DatabaseConnection } from '@/database/main/entities';
import { CreateDatabaseConnectionDto } from '@/modules/admin/dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { omit } from 'lodash';
import { Client } from 'pg';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class MainDatabaseConnectionService {
  constructor(
    @InjectRepository(DatabaseConnection)
    private readonly dbConnectionRepo: Repository<DatabaseConnection>,
    private readonly configService: ConfigService,
  ) {}

  async updateDatabaseConnection(
    data: Partial<DatabaseConnection>,
    dbConnectionId: string,
  ) {
    return this.dbConnectionRepo.update({ id: dbConnectionId }, data);
  }

  async findAvailableDbConnections() {
    return this.dbConnectionRepo.find({
      where: {
        isConnected: false,
        lastConnectedAt: IsNull(),
      },
    });
  }

  async createNewDatabaseConnection(
    createDatabaseConnectionDto: CreateDatabaseConnectionDto,
  ) {
    await this.testConnection(createDatabaseConnectionDto);

    const newDatabaseConnection = this.dbConnectionRepo.create({
      ...createDatabaseConnectionDto,
      database: createDatabaseConnectionDto.databaseName,
      password: encryptPayload(
        createDatabaseConnectionDto.password,
        this.configService,
      ),
    });
    await this.dbConnectionRepo.save(newDatabaseConnection);

    return {
      message: `Đã tạo mới kết nối database thành công.`,
      data: omit(newDatabaseConnection, ['password']),
    };
  }

  private async testConnection(dto: CreateDatabaseConnectionDto) {
    const client = new Client({
      host: dto.host,
      port: dto.port,
      user: dto.username,
      password: dto.password,
      database: dto.databaseName,
    });

    try {
      await client.connect();
      await client.query('SELECT 1');
      return { message: 'Kết nối thành công tới cơ sở dữ liệu!' };
    } catch (error) {
      throw new BadRequestException(
        `Kết nối thất bại tới cơ sở dữ liệu: ${error.message}`,
      );
    } finally {
      await client.end();
    }
  }
}
