import {
  CreateProductDto,
  GetProductDetailQueryDto,
  GetProductsQueryDto,
  UpdateProductDto,
} from '@/common/dtos/products';
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
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager, FindOptionsRelations, Repository, Brackets } from 'typeorm';

@Injectable()
export class ProductsService {
  constructor(
    private readonly tenantService: TenantService,
    private readonly booksService: BooksService,
    private readonly supplierService: SupplierService,
    private readonly categoriesService: CategoriesService,
    private readonly inventoriesService: InventoriesService,
  ) { }

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
    createProductDto: CreateProductDto,
    manager: EntityManager,
    employee: Employee,
    supplierId: string,
  ) {
    const productRepo = manager.getRepository(Product);
    const supplierRepo = manager.getRepository(Supplier);
    const categoryRepo = manager.getRepository(Category);
    const inventoryLogRepo = manager.getRepository(InventoryLog);

    const { createInventoryDto, createBookDto, type, categoryIds, ...res } =
      createProductDto;

    const supplier = await this.supplierService.findSupplierByField(
      'id',
      supplierId,
      supplierRepo,
    );

    if (!supplier)
      throw new NotFoundException(
        `Không tìm thấy nhà cung cấp với mã ${supplierId}.`,
      );

    let newProduct = await productRepo.findOne({
      where: [{ sku: res.sku }, { name: res.name }],
    });

    if (newProduct) {
      await productRepo.update(
        {
          id: newProduct.id,
        },
        {
          price: res.price,
          ...(res?.description?.trim() && {
            description: res.description.trim(),
          }),
          type,
          supplier,
          categories: [],
        },
      );
    } else {
      newProduct = productRepo.create({
        ...res,
        type,
        supplier,
        categories: [],
      });

      await productRepo.save(newProduct);
    }

    await this.categoriesService.assignCategoriesToProduct(
      categoryIds,
      newProduct,
      categoryRepo,
      productRepo,
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
        note: 'Nhập thêm hàng từ đơn mua',
      },
      inventoryLogRepo,
    );

    return this.findProductByField('id', newProduct.id, productRepo, {
      inventory: true,
      categories: true,
      book: type === ProductType.BOOK,
      supplier: true,
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
      keyword,
    } = getProductsQueryDto;

    if (keyword?.trim()) {
      const searchTerm = `%${keyword.trim()}%`;
      qb.andWhere(
        new Brackets((qb) => {
          qb.where('product.name ILIKE :keyword', { keyword: searchTerm })
            .orWhere('product.sku ILIKE :keyword', { keyword: searchTerm })
            // Nếu sản phẩm là Sách, tìm luôn trong tên tác giả hoặc ISBN
            .orWhere('book.isbn ILIKE :keyword', { keyword: searchTerm });

          // Bạn có thể mở rộng thêm tìm kiếm theo danh mục nếu muốn:
          // .orWhere('categories.name ILIKE :keyword', { keyword: searchTerm });
        }),
      );
    }

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

  async getProductDetail(
    getProductDetailQueryDto: GetProductDetailQueryDto,
    bookStoreId: string,
  ) {
    if (Object.keys(getProductDetailQueryDto)?.length <= 0)
      throw new BadRequestException(
        'Vui lòng cung cấp mã sku hoặc id của sản phẩm.',
      );

    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const productRepo = dataSource.getRepository(Product);
    const { sku, id } = getProductDetailQueryDto;

    const product = await productRepo.findOne({
      where: {
        ...(id?.trim() && { id }),
        ...(sku?.trim() && { sku }),
      },
      relations: {
        book: true,
        categories: true,
        supplier: true,
        inventory: true,
      },
    });

    if (!product)
      throw new NotFoundException('Không tìm thấy thông tin sản phẩm.');

    return product;
  }

  async deleteProduct(
    getProductDetailQueryDto: GetProductDetailQueryDto,
    bookStoreId: string,
  ) {
    const { sku, id } = getProductDetailQueryDto;

    if (!sku?.trim() && !id?.trim())
      throw new BadRequestException(
        'Vui lòng cung cấp SKU hoặc ID của sản phẩm.',
      );

    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const productRepo = dataSource.getRepository(Product);

    const product = await productRepo.findOne({
      where: {
        ...(id?.trim() && { id }),
        ...(sku?.trim() && { sku }),
      },
      relations: {
        book: true,
      },
    });

    if (!product)
      throw new NotFoundException('Không tìm thấy thông tin sản phẩm');

    if (!product.isActive) {
      throw new ConflictException('Sản phẩm đã được xoá.');
    }

    product.isActive = false;
    await productRepo.save(product);

    return {
      message: 'Sản phẩm đã được xoá thành công.',
      success: true,
    };
  }

  async updateProduct(
    id: string,
    bookStoreId: string,
    updateProductDto: UpdateProductDto,
  ) {
    if (Object.keys(updateProductDto).length <= 0)
      throw new BadRequestException(
        'Vui lòng cung cấp dữ liệu để cập nhật sản phẩm.',
      );

    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const productRepo = dataSource.getRepository(Product);

    const product = await productRepo.findOne({
      where: {
        id,
      },
    });

    if (!product)
      throw new NotFoundException('Không tìm thấy thông tin sản phẩm.');

    const { sku, name } = updateProductDto;

    if (sku?.trim()) {
      const existing = await this.findProductByField('sku', sku, productRepo);

      if (existing && existing.id !== product.id)
        throw new ConflictException(`Sản phẩm với mã SKU ${sku} đã tồn tại.`);
    }

    if (name?.trim()) {
      const existing = await this.findProductByField('name', name, productRepo);

      if (existing && existing.id !== product.id)
        throw new ConflictException(`Sản phẩm với tên ${name} đã tồn tại.`);
    }

    Object.assign(product, updateProductDto);
    await productRepo.save(product);

    return this.getProductDetail(
      {
        id,
      },
      bookStoreId,
    );
  }
}
