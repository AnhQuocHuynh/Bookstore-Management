import { generateStoreCode } from '@/common/utils';
import { CreateBookStoreDto } from '@/database/main/dto';
import { BookStore } from '@/database/main/entities';
import { MainDatabaseConnectionService } from '@/database/main/services/main-database-connection.service';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { omit } from 'lodash';
import {
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsWhere,
  Repository,
} from 'typeorm';

@Injectable()
export class MainBookStoreService {
  constructor(
    @InjectRepository(BookStore)
    private readonly bookStoreRepo: Repository<BookStore>,
    private readonly mainDatabaseConnectionService: MainDatabaseConnectionService,
  ) {}

  async findBookStores(condition?: FindOptionsWhere<BookStore>) {
    const bookStores = await this.bookStoreRepo.find({
      ...(condition && { where: condition }),
      relations: {
        user: true,
      },
    });
    return bookStores.map((bs) => omit(bs, ['user.password']));
  }

  async findBookStoreByField(
    field: keyof BookStore,
    value: string,
    relations?: FindOptionsRelations<BookStore> | undefined,
  ) {
    const bookStore = await this.bookStoreRepo.findOne({
      where: {
        [field]: value,
      },
      ...(relations && { relations }),
    });

    return bookStore ?? null;
  }

  async createNewBookStore(
    createBookStoreDto: CreateBookStoreDto,
    userId: string,
  ) {
    const availableDbConnections =
      await this.mainDatabaseConnectionService.findAvailableDbConnections();

    if (!availableDbConnections.length)
      throw new NotFoundException(
        'Tất cả các cơ sở dữ liệu của hệ thống đã được sử dụng. Liên hệ với quản trị viên để được tư vấn.',
      );

    const { name } = createBookStoreDto;

    const newBookStore = this.bookStoreRepo.create({
      ...createBookStoreDto,
      code: await this.generateUniqueStoreCode(name),
      connection: {
        id: availableDbConnections[0].id,
      },
      user: {
        id: userId,
      },
    });

    await this.mainDatabaseConnectionService.updateDatabaseConnection(
      {
        isConnected: true,
        lastConnectedAt: new Date(),
      },
      availableDbConnections[0].id,
    );

    return this.bookStoreRepo.save(newBookStore);
  }

  async updateBookStore(data: Partial<BookStore>, bookStoreId: string) {
    await this.bookStoreRepo.update({ id: bookStoreId }, data);
    return this.findBookStoreByField('id', bookStoreId);
  }

  async checkDuplicateField(
    field: keyof BookStore,
    value: string,
    email: string,
    fieldLabel: string,
  ) {
    const existing = await this.findBookStoreByField(field, value, {
      user: true,
    });

    if (!existing) return;

    if (existing.user.email === email) {
      throw new ConflictException(
        `Bạn đã tạo cửa hàng có ${fieldLabel} ${value} rồi.`,
      );
    }

    throw new ConflictException(
      `Cửa hàng có ${fieldLabel} '${value}' đã tồn tại. Vui lòng chọn ${fieldLabel} khác.`,
    );
  }

  async getBookStoresOfUser(
    userId: string,
    optionOrder?: FindOptionsOrder<BookStore>,
  ) {
    return this.bookStoreRepo.find({
      where: {
        user: {
          id: userId,
        },
      },
      order: optionOrder,
    });
  }

  private async generateUniqueStoreCode(storeName: string): Promise<string> {
    while (true) {
      const code = generateStoreCode(storeName);
      const exists = await this.bookStoreRepo.findOne({ where: { code } });
      if (!exists) return code;
    }
  }
}
