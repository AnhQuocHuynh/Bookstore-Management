import { CreateProductDto, GetProductsQueryDto } from '@/common/dtos/products';
import { InventoryLogAction, ProductType } from '@/common/enums';
import { TUserSession } from '@/common/utils';
import {
  Category,
  Employee,
  InventoryLog,
  Product,
  Supplier,
} from '@/database/tenant/entities';
import { BooksService } from '@/modules/books/books.service';
import { CategoriesService } from '@/modules/categories/categories.service';
import { InventoriesService } from '@/modules/inventories/inventories.service';
import { SupplierService } from '@/modules/suppliers/supplier.service';
import { TenantService } from '@/tenants/tenant.service';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FindOptionsRelations, Repository } from 'typeorm';

@Injectable()
export class ProductsService {
  constructor(
    private readonly tenantService: TenantService,
    private readonly booksService: BooksService,
    private readonly supplierService: SupplierService,
    private readonly categoriesService: CategoriesService,
    private readonly inventoriesService: InventoriesService,
  ) {}

  async findProductByField(
    field: keyof Product,
    value: string,
    repo: Repository<Product>,
    relations?: FindOptionsRelations<Product> | undefined,
  ) {
    return (
      repo.findOne({
        where: {
          [field]: value,
        },
        ...(relations && { relations }),
      }) ?? null
    );
  }

  async createProduct(
    userSession: TUserSession,
    createProductDto: CreateProductDto,
  ) {
    const { bookStoreId } = userSession;

    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    return dataSource.transaction(async (manager) => {
      const productRepo = manager.getRepository(Product);
      const supplierRepo = manager.getRepository(Supplier);
      const categoryRepo = manager.getRepository(Category);
      const inventoryLogRepo = manager.getRepository(InventoryLog);
      const employeeRepo = manager.getRepository(Employee);

      const employee = await employeeRepo.findOne({
        where: {
          id: userSession.userId,
        },
      });

      if (!employee) throw new NotFoundException('Your profile not found.');

      const {
        createInventoryDto,
        createBookDto,
        type,
        categoryIds,
        supplierId,
        ...res
      } = createProductDto;

      const existingName = await this.findProductByField(
        'name',
        res.name,
        productRepo,
      );

      if (existingName) {
        throw new ConflictException(`Product ${res.name} has been existed.`);
      }

      const supplier = await this.supplierService.findSupplierByField(
        'id',
        supplierId,
        supplierRepo,
      );

      if (!supplier)
        throw new NotFoundException(`Supplier ${supplierId} not found.`);

      const newProduct = productRepo.create({
        ...res,
        type,
        sku: await this.generateUniqueSKU(type, productRepo),
      });

      await productRepo.save(newProduct);

      await this.categoriesService.assignCategoriesToProduct(
        categoryIds,
        newProduct.id,
        productRepo,
        categoryRepo,
      );

      if (
        type === ProductType.BOOK &&
        createBookDto &&
        Object.keys(createBookDto).length > 0
      ) {
        const newBook = await this.booksService.createBook(
          createBookDto,
          manager,
        );
        newProduct.book = newBook;
        await productRepo.save(newProduct);
      }

      const inventory = await this.inventoriesService.createNewInventory(
        createInventoryDto,
        manager,
      );

      newProduct.inventory = inventory;
      await productRepo.save(newProduct);

      await this.inventoriesService.createNewInventoryLog(
        {
          inventory,
          quantityChange: createInventoryDto.stockQuantity,
          action: InventoryLogAction.PURCHASE,
          employee,
          note: 'Restocked product from purchase',
        },
        inventoryLogRepo,
      );

      return {
        message: 'Product created successfully.',
        data: await this.findProductByField('id', newProduct.id, productRepo, {
          inventory: true,
          categories: true,
          book: type === ProductType.BOOK,
          supplier: true,
        }),
      };
    });
  }

  private async generateUniqueSKU(
    type: ProductType,
    repo: Repository<Product>,
  ): Promise<string> {
    const prefix = type === ProductType.BOOK ? 'BOOK' : 'STA';
    while (true) {
      const sku = `${prefix}-${Date.now().toString().slice(-5)}-${Math.floor(
        100 + Math.random() * 900,
      )}`;
      const exists = await repo.exists({
        where: { sku },
      });
      if (!exists) return sku;
    }
  }

  async getProducts(
    getProductsQueryDto: GetProductsQueryDto,
    userSession: TUserSession,
  ) {
    const { bookStoreId } = userSession;

    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const productRepo = dataSource.getRepository(Product);
    const qb = productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.categories', 'categories')
      .leftJoinAndSelect('product.supplier', 'supplier')
      .leftJoinAndSelect('product.book', 'book')
      .leftJoinAndSelect('product.inventory', 'inventory');

    const {
      name,
      sku,
      type,
      categoryName,
      categorySlug,
      supplierName,
      isActive,
      sortBy,
      sortOrder,
    } = getProductsQueryDto;

    const exactFilters: Record<string, any> = {
      sku,
      type,
      isActive,
    };

    Object.entries(exactFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        qb.andWhere(`product.${key} = :${key}`, { [key]: value });
      }
    });

    const ilikeFilters: Record<string, string | undefined> = {
      name,
    };

    Object.entries(ilikeFilters).forEach(([key, value]) => {
      if (value) {
        qb.andWhere(`product.${key} ILIKE :${key}`, { [key]: `%${value}%` });
      }
    });

    if (categoryName?.trim() || categorySlug?.trim()) {
      if (categoryName?.trim()) {
        qb.andWhere('category.name ILIKE :categoryName', {
          categoryName: `%${categoryName?.trim()}%`,
        });
      }

      if (categorySlug?.trim()) {
        qb.andWhere('category.slug = :categorySlug', {
          categorySlug: categorySlug?.trim(),
        });
      }
    }

    if (supplierName?.trim()) {
      qb.andWhere('supplier.name ILIKE :supplierName', {
        supplierName,
      });
    }

    if (sortBy?.trim() && sortOrder?.trim()) {
      qb.orderBy(
        `product.${sortBy?.trim()}`,
        sortOrder?.trim().toUpperCase() as 'ASC' | 'DESC',
      );
    }

    return qb.getMany();
  }
}
