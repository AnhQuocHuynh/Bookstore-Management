import { CreateCategoryDto } from '@/common/dtos';
import { TUserSession } from '@/common/utils';
import { Book, Category, Product } from '@/database/tenant/entities';
import { TenantService } from '@/tenants/tenant.service';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { omit } from 'lodash';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriesService {
  constructor(private readonly tenantsService: TenantService) {}

  async getCategories(userSession: TUserSession) {
    const { bookStoreId } = userSession;

    const dataSource = await this.tenantsService.getTenantConnection({
      bookStoreId,
    });

    const categoryRepo = dataSource.getRepository(Category);

    return categoryRepo.find();
  }

  async findCategoryByField(
    field: keyof Category,
    value: string,
    repo: Repository<Category>,
  ) {
    return (
      repo.findOne({
        where: {
          [field]: value,
        },
      }) ?? null
    );
  }

  async createNewCategory(
    createCategoryDto: CreateCategoryDto,
    userSession: TUserSession,
  ) {
    const { bookStoreId } = userSession;
    const { slug, name, parentId } = createCategoryDto;

    const dataSource = await this.tenantsService.getTenantConnection({
      bookStoreId,
    });

    const categoryRepo = dataSource.getRepository(Category);

    let parent: Category | null = null;

    if (parentId?.trim()) {
      parent = await this.findCategoryByField('id', parentId, categoryRepo);
      if (!parent) throw new NotFoundException('Parent of category not found.');
    }

    const existedSlug = await this.findCategoryByField(
      'slug',
      slug,
      categoryRepo,
    );

    if (existedSlug)
      throw new ConflictException(
        `Category has slug ${slug} has been existed.`,
      );

    const existedName = await this.findCategoryByField(
      'name',
      name,
      categoryRepo,
    );

    if (existedName)
      throw new ConflictException(
        `Category has name ${slug} has been existed.`,
      );

    const newCategory = categoryRepo.create({
      ...omit(createCategoryDto, ['parentId']),
      ...(parent && { parent }),
    });

    await categoryRepo.save(newCategory);

    return {
      message: 'New category created successfully.',
      data: newCategory,
    };
  }

  async assignCategoriesToProduct(
    categoryIds: string[],
    productId: string,
    productRepo: Repository<Product>,
    categoryRepo: Repository<Category>,
  ) {}
}
