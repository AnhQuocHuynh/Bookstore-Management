import { assignDefined } from '@/common/utils';
import { Publisher } from '@/database/tenant/entities';
import {
  CreatePublisherDto,
  UpdatePublisherDto,
} from '@/modules/publishers/dto';
import { TenantService } from '@/tenants/tenant.service';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class PublishersService {
  constructor(private readonly tenantService: TenantService) {}

  async getPublisherByField(
    field: keyof Publisher,
    value: string,
    repo: Repository<Publisher>,
  ) {
    return (
      repo.findOne({
        where: {
          [field]: value,
        },
      }) ?? null
    );
  }

  async getPublishers(bookStoreId: string) {
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const publisherRepo = dataSource.getRepository(Publisher);
    return publisherRepo.find();
  }

  async createPublisher(
    createPublisherDto: CreatePublisherDto,
    bookStoreId: string,
  ) {
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const { name, email, phone } = createPublisherDto;
    const publisherRepo = dataSource.getRepository(Publisher);

    await this.checkValidPublisher('name', name, publisherRepo);

    if (email?.trim())
      await this.checkValidPublisher('email', email, publisherRepo);

    if (phone?.trim())
      await this.checkValidPublisher('phone', phone, publisherRepo);

    const newPublisher = publisherRepo.create(createPublisherDto);
    return publisherRepo.save(newPublisher);
  }

  async getPublisherById(id: string, bookStoreId: string) {
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const publisherRepo = dataSource.getRepository(Publisher);
    const publisher = await publisherRepo.findOne({
      where: {
        id,
      },
    });

    if (!publisher)
      throw new NotFoundException('Không tìm thấy thông tin nhà xuất bản.');
    return publisher;
  }

  async updatePublisherById(
    id: string,
    updatePublisherDto: UpdatePublisherDto,
    bookStoreId: string,
  ) {
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const publisherRepo = dataSource.getRepository(Publisher);
    const publisher = await publisherRepo.findOne({
      where: {
        id,
      },
    });

    if (!publisher)
      throw new NotFoundException('Không tìm thấy thông tin nhà xuất bản.');
    assignDefined(publisher, updatePublisherDto);
    await publisherRepo.save(publisher);

    return this.getPublisherById(id, bookStoreId);
  }

  async deletePublisherById(id: string, bookStoreId: string) {
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const publisherRepo = dataSource.getRepository(Publisher);
    await this.getPublisherById(id, bookStoreId);

    await publisherRepo.delete({ id });
    return this.getPublishers(bookStoreId);
  }

  private async checkValidPublisher(
    field: string,
    value: string,
    repo: Repository<Publisher>,
  ) {
    const existing = await repo.findOne({
      where: {
        [field]: value,
      },
    });

    if (existing)
      throw new ConflictException(
        `${field === 'name' ? 'Tên' : field === 'email' ? 'Email' : 'Số điện thoại'} này đã được sử dụng bởi một nhà xuất bản khác.`,
      );
  }
}
