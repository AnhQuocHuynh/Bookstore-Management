import {
  CreateCategoryDto,
  GetCategoriesQueryDto,
  UpdateCategoryDto,
} from '@/common/dtos';
import { CategoryStatus } from '@/common/enums';
import { assignDefined, TUserSession } from '@/common/utils';
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
  constructor(private readonly tenantsService: TenantService) { }

  async getCategories(
    userSession: TUserSession,
    getCategoriesQueryDto: GetCategoriesQueryDto,
  ) {
    const { bookStoreId } = userSession;
    const { page = 1, limit = 10, status, parentId } = getCategoriesQueryDto;

    const dataSource = await this.tenantsService.getTenantConnection({
      bookStoreId,
    });

    const categoryRepo = dataSource.getRepository(Category);

    const where: any = {};
    if (status) {
      where.status = status;
    } else {
      where.status = CategoryStatus.ACTIVE;
    }
    if (parentId) {
      where.parent = { id: parentId };
    }

    const skip = (page - 1) * limit;

    const [data, total] = await categoryRepo.findAndCount({
      where,
      // relations: parentId ? [] : ['parent'],
      skip,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      data,
      total,
      page,
      limit,
    };
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
    // Bây giờ có thể lấy trực tiếp parentId từ DTO
    const { slug, name, parentId } = createCategoryDto;

    const dataSource = await this.tenantsService.getTenantConnection({
      bookStoreId,
    });
    const categoryRepo = dataSource.getRepository(Category);

    // ... (Giữ nguyên các đoạn kiểm tra trùng lặp slug, name) ...

    let parent: Category | null = null;
    if (parentId) {
      parent = await this.findCategoryByField('id', parentId, categoryRepo);
      if (!parent) {
        throw new NotFoundException('Danh mục cha không tồn tại.');
      }
    }

    const newCategory = categoryRepo.create({
      ...omit(createCategoryDto, ['parentId']), // Loại bỏ parentId string
      parent: parent || undefined, // Gán object parent (nếu có)
    });

    await categoryRepo.save(newCategory);
    return {
      message: 'New category created successfully.',
      data: newCategory,
    };
  }

  async getCategoryById(userSession: TUserSession, id: string) {
    const { bookStoreId } = userSession;

    const dataSource = await this.tenantsService.getTenantConnection({
      bookStoreId,
    });

    const categoryRepo = dataSource.getRepository(Category);

    const category = await categoryRepo.findOne({
      where: {
        id,
      },
      relations: ['parent', 'children'],
    });

    if (!category) {
      throw new NotFoundException('Không tìm thấy thông tin danh mục.');
    }

    return category;
  }

  async updateCategory(
    userSession: TUserSession,
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ) {
    const { bookStoreId } = userSession;
    const { slug, name } = updateCategoryDto;

    const dataSource = await this.tenantsService.getTenantConnection({
      bookStoreId,
    });

    const categoryRepo = dataSource.getRepository(Category);

    const category = await categoryRepo.findOne({
      where: {
        id,
      },
    });

    if (!category) {
      throw new NotFoundException('Không tìm thấy thông tin danh mục.');
    }

    if (slug && slug !== category.slug) {
      const existedSlug = await this.findCategoryByField(
        'slug',
        slug,
        categoryRepo,
      );
      if (existedSlug && existedSlug.id !== id) {
        throw new ConflictException(`Danh mục có slug ${slug} đã tồn tại.`);
      }
    }

    if (name && name !== category.name) {
      const existedName = await this.findCategoryByField(
        'name',
        name,
        categoryRepo,
      );
      if (existedName && existedName.id !== id) {
        throw new ConflictException(`Danh mục có tên ${name} đã tồn tại.`);
      }
    }

    assignDefined(category, omit(updateCategoryDto, ['parentId']));

    await categoryRepo.save(category);

    return {
      message: 'Category updated successfully.',
      data: await this.getCategoryById(userSession, id),
    };
  }

  async deleteCategory(userSession: TUserSession, id: string) {
    const { bookStoreId } = userSession;

    const dataSource = await this.tenantsService.getTenantConnection({
      bookStoreId,
    });

    const categoryRepo = dataSource.getRepository(Category);

    const category = await categoryRepo.findOne({
      where: {
        id,
      },
    });

    if (!category) {
      throw new NotFoundException('Không tìm thấy thông tin danh mục.');
    }

    category.status = CategoryStatus.INACTIVE;
    await categoryRepo.save(category);

    return {
      message: 'Category deleted successfully.',
    };
  }

  async assignCategoriesToProduct(
    categoryIds: string[],
    product: Product,
    categoryRepo: Repository<Category>,
    productRepo: Repository<Product>,
  ) {
    await Promise.all(
      categoryIds.map(async (categoryId) => {
        const category = await categoryRepo.findOne({
          where: {
            id: categoryId,
          },
        });

        if (category) {
          product.categories.push(category);
          await productRepo.save(product);
        }
      }),
    );
  }
}
