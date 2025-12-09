import { CreateAuthorDto } from '@/common/dtos';
import { TUserSession } from '@/common/utils';
import { Author } from '@/database/tenant/entities';
import { TenantService } from '@/tenants/tenant.service';
import { ConflictException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class AuthorsService {
  constructor(private readonly tenantService: TenantService) {}

  async findAuthorByField(
    field: keyof Author,
    value: string,
    repo: Repository<Author>,
  ) {
    return (
      repo.findOne({
        where: {
          [field]: value,
        },
      }) ?? null
    );
  }

  async createAuthor(
    createAuthorDto: CreateAuthorDto,
    userSession: TUserSession,
  ) {
    const { bookStoreId } = userSession;
    const { email, phone } = createAuthorDto;

    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const authorRepo = dataSource.getRepository(Author);

    if (email?.trim()) {
      const existingEmail = await this.findAuthorByField(
        'email',
        email,
        authorRepo,
      );

      if (existingEmail)
        throw new ConflictException(
          `Author with email ${email} has been existed.`,
        );
    }

    if (phone?.trim()) {
      const existingPhone = await this.findAuthorByField(
        'phone',
        phone,
        authorRepo,
      );

      if (existingPhone)
        throw new ConflictException(
          `Author with phone ${phone} has been existed.`,
        );
    }

    const newAuthor = authorRepo.create(createAuthorDto);

    return {
      message: 'Thông tin tác giả được tạo thành công.',
      data: await authorRepo.save(newAuthor),
    };
  }
}
