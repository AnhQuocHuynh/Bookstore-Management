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
import { FindOptionsRelations, Repository } from 'typeorm';

@Injectable()
export class MainBookStoreService {
  constructor(
    @InjectRepository(BookStore)
    private readonly bookStoreRepo: Repository<BookStore>,
    private readonly mainDatabaseConnectionService: MainDatabaseConnectionService,
  ) {}

  async findBookStores() {
    const bookStores = await this.bookStoreRepo.find({
      where: {
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

    if (!bookStore) throw new NotFoundException(`Không tìm thấy cửa hàng.`);

    return bookStore;
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

    const { name, phoneNumber } = createBookStoreDto;

    await this.checkDuplicateField('name', name, userId, 'tên');

    await this.checkDuplicateField(
      'phoneNumber',
      phoneNumber,
      userId,
      'số điện thoại',
    );

    const newBookStore = this.bookStoreRepo.create({
      ...createBookStoreDto,
      code: await this.generateUniqueStoreCode(name),
      connection: {
        id: availableDbConnections[0].id,
      },
    });

    return this.bookStoreRepo.save(newBookStore);
  }

  async updateBookStore(data: Partial<BookStore>, bookStoreId: string) {
    await this.bookStoreRepo.update({ id: bookStoreId }, data);
  }

  private async checkDuplicateField(
    field: keyof BookStore,
    value: string,
    userId: string,
    fieldLabel: string,
  ) {
    const existing = await this.findBookStoreByField(field, value, {
      user: true,
    });

    if (!existing) return;

    if (existing.user.id === userId) {
      throw new ConflictException(
        `Bạn đã tạo cửa hàng có ${fieldLabel} ${value} rồi.`,
      );
    }

    throw new ConflictException(
      `Cửa hàng có ${fieldLabel} '${value}' đã tồn tại. Vui lòng chọn ${fieldLabel} khác.`,
    );
  }

  private async generateUniqueStoreCode(storeName: string): Promise<string> {
    while (true) {
      const code = generateStoreCode(storeName);
      const exists = await this.bookStoreRepo.findOne({ where: { code } });
      if (!exists) return code;
    }
  }
}
