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
  constructor(private readonly tenantsService: TenantService) {}

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
      relations: parentId ? [] : ['parent'],
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
      throw new NotFoundException('Category not found.');
    }

    return category;
  }

  async updateCategory(
    userSession: TUserSession,
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ) {
    const { bookStoreId } = userSession;
    const { slug, name, parentId } = updateCategoryDto;

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
      throw new NotFoundException('Category not found.');
    }

    let parent: Category | null = null;
    if (parentId?.trim()) {
      parent = await this.findCategoryByField('id', parentId, categoryRepo);
      if (!parent) {
        throw new NotFoundException('Parent of category not found.');
      }
      if (parent.id === id) {
        throw new ConflictException(
          'A category cannot be set as its own parent.',
        );
      }
    }

    if (slug && slug !== category.slug) {
      const existedSlug = await this.findCategoryByField(
        'slug',
        slug,
        categoryRepo,
      );
      if (existedSlug && existedSlug.id !== id) {
        throw new ConflictException(
          `Category with slug ${slug} has already been existed.`,
        );
      }
    }

    if (name && name !== category.name) {
      const existedName = await this.findCategoryByField(
        'name',
        name,
        categoryRepo,
      );
      if (existedName && existedName.id !== id) {
        throw new ConflictException(
          `Category with name ${name} has already been existed.`,
        );
      }
    }

    assignDefined(category, omit(updateCategoryDto, ['parentId']));

    if (parentId !== undefined) {
      category.parent = parent || undefined;
    }

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
      throw new NotFoundException('Category not found.');
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
