import {
  CreateAuthorDto,
  GetAuthorsQueryDto,
  UpdateAuthorDto,
} from '@/common/dtos';
import { TUserSession, assignDefined } from '@/common/utils';
import { Author } from '@/database/tenant/entities';
import { TenantService } from '@/tenants/tenant.service';
import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository, Brackets } from 'typeorm';

@Injectable()
export class AuthorsService {
  constructor(private readonly tenantService: TenantService) {}

  // --- CÁC HÀM HELPER ---

  // Helper 1: Tìm tác giả theo trường cụ thể (Đã khôi phục lại hàm này)
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

  // Helper 2: Kiểm tra và lấy bookStoreId từ session
  private getBookStoreId(userSession: TUserSession): string {
    if (!userSession.bookStoreId) {
      throw new BadRequestException('Missing BookStore ID in user session.');
    }
    return userSession.bookStoreId;
  }

  // Helper 3: Lấy chi tiết tác giả theo ID
  async getAuthorById(id: string, bookStoreId: string) {
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });
    const authorRepo = dataSource.getRepository(Author);
    const author = await authorRepo.findOne({ where: { id } });

    if (!author) {
      throw new NotFoundException('Không tìm thấy thông tin tác giả.');
    }
    return author;
  }

  // --- CÁC HÀM NGHIỆP VỤ CHÍNH ---

  // 1. Tạo tác giả mới
  async createAuthor(
    createAuthorDto: CreateAuthorDto,
    userSession: TUserSession,
  ) {
    const bookStoreId = this.getBookStoreId(userSession);
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

  // 2. Lấy danh sách tác giả (Có tìm kiếm)
  async getAuthors(userSession: TUserSession, query: GetAuthorsQueryDto) {
    const bookStoreId = this.getBookStoreId(userSession);
    const { keyword } = query;

    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });
    const authorRepo = dataSource.getRepository(Author);

    const qb = authorRepo.createQueryBuilder('author');

    if (keyword?.trim()) {
      const searchTerm = `%${keyword.trim()}%`;
      qb.andWhere(
        new Brackets((qb) => {
          qb.where('author.fullName ILIKE :keyword', {
            keyword: searchTerm,
          }).orWhere('author.penName ILIKE :keyword', { keyword: searchTerm });
        }),
      );
    }

    qb.orderBy('author.createdAt', 'DESC');
    return qb.getMany();
  }

  // 3. Cập nhật tác giả
  async updateAuthor(
    id: string,
    updateAuthorDto: UpdateAuthorDto,
    userSession: TUserSession,
  ) {
    const bookStoreId = this.getBookStoreId(userSession);
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });
    const authorRepo = dataSource.getRepository(Author);

    // Tìm tác giả
    const author = await this.getAuthorById(id, bookStoreId);

    // Kiểm tra trùng Email
    if (updateAuthorDto.email && updateAuthorDto.email !== author.email) {
      const existingEmail = await this.findAuthorByField(
        'email',
        updateAuthorDto.email,
        authorRepo,
      );
      if (existingEmail)
        throw new ConflictException(
          `Email ${updateAuthorDto.email} đã được sử dụng.`,
        );
    }

    // Kiểm tra trùng SĐT
    if (updateAuthorDto.phone && updateAuthorDto.phone !== author.phone) {
      const existingPhone = await this.findAuthorByField(
        'phone',
        updateAuthorDto.phone,
        authorRepo,
      );
      if (existingPhone)
        throw new ConflictException(
          `Số điện thoại ${updateAuthorDto.phone} đã được sử dụng.`,
        );
    }

    assignDefined(author, updateAuthorDto);
    return authorRepo.save(author);
  }

  // 4. Xóa tác giả
  async deleteAuthor(id: string, userSession: TUserSession) {
    const bookStoreId = this.getBookStoreId(userSession);
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });
    const authorRepo = dataSource.getRepository(Author);

    // Kiểm tra tồn tại trước khi xóa
    await this.getAuthorById(id, bookStoreId);

    await authorRepo.delete(id);

    return {
      message: 'Đã xóa tác giả thành công.',
      id,
    };
  }
}
