import { MainDatabaseConnectionService } from '@/database/main/services/main-database-connection.service';
import { CreateDatabaseConnectionDto } from '@/modules/admin/dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminService {
  constructor(
    private readonly mainDatabaseConnectionService: MainDatabaseConnectionService,
  ) {}

  async createDatabaseConnection(
    createDatabaseConnectionDto: CreateDatabaseConnectionDto,
  ) {
    return this.mainDatabaseConnectionService.createNewDatabaseConnection(
      createDatabaseConnectionDto,
    );
  }
}
