import {
  CreateDisplayProductDto,
  CreateDisplayShelfDto,
  GetDisplayProductsQueryDto,
  GetLogsQueryDto,
  MoveDisplayProductDto,
  ReduceDisplayProductQuantityDto,
  UpdateDisplayProductDto,
  UpdateDisplayShelfDto,
} from '@/common/dtos';
import { DisplayLogAction, DisplayProductStatus } from '@/common/enums';
import { TUserSession } from '@/common/utils';
import {
  DisplayLog,
  DisplayProduct,
  DisplayShelf,
  Employee,
  Inventory,
  Product,
} from '@/database/tenant/entities';
import { TenantService } from '@/tenants/tenant.service';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { omit } from 'lodash';
import { Repository } from 'typeorm';

@Injectable()
export class DisplayService {
  constructor(private readonly tenantService: TenantService) {}

  async findDisplayShelfByField(
    field: keyof DisplayShelf,
    value: string,
    repo: Repository<DisplayShelf>,
  ) {
    return (
      repo.findOne({
        where: {
          [field]: value,
        },
      }) ?? null
    );
  }

  async createDisplayShelf(
    createDisplaySelfDto: CreateDisplayShelfDto,
    userSession: TUserSession,
  ) {
    const { bookStoreId } = userSession;

    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const { name } = createDisplaySelfDto;
    const displaySelfRepo = dataSource.getRepository(DisplayShelf);

    const existingName = await this.findDisplayShelfByField(
      'name',
      name,
      displaySelfRepo,
    );

    if (existingName)
      throw new ConflictException(`Kệ trưng bày ${name} đã tồn tại.`);

    const newDisplaySelf = displaySelfRepo.create(createDisplaySelfDto);

    return displaySelfRepo.save(newDisplaySelf);
  }

  // --- [UPDATED] Xử lý logic Hồi sinh (Revive) ---
  async createDisplayProduct(
    createDisplayProductDto: CreateDisplayProductDto,
    userSession: TUserSession,
  ) {
    const { bookStoreId, userId } = userSession;

    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const { productId, displayShelfId, quantity } = createDisplayProductDto;
    const employeeRepo = dataSource.getRepository(Employee);
    const displayProductRepo = dataSource.getRepository(DisplayProduct);
    const productRepo = dataSource.getRepository(Product);
    const displayShelfRepo = dataSource.getRepository(DisplayShelf);
    const inventoryRepo = dataSource.getRepository(Inventory);
    const displayLogRepo = dataSource.getRepository(DisplayLog);

    const employee = await employeeRepo.findOne({
      where: {
        id: userId,
      },
    });

    if (!employee)
      throw new NotFoundException('Không tìm thấy thông tin của bạn.');

    const product = await productRepo.findOne({
      where: {
        id: productId,
      },
      relations: {
        inventory: true,
      },
    });

    if (!product)
      throw new NotFoundException(
        `Không tìm thấy sản phẩm có mã ID '${productId}'.`,
      );

    if (!product.isActive) {
      throw new BadRequestException(
        'Sản phẩm này đang tạm thời không hoạt động nên không thể trưng bày.',
      );
    }

    if (product.inventory.availableQuantity < quantity) {
      throw new BadRequestException(
        'Không đủ hàng tồn kho để trưng bày sản phẩm này.',
      );
    }

    // 1. Kiểm tra xem sản phẩm đã từng tồn tại trên kệ này chưa (Active hoặc Inactive)
    const existing = await displayProductRepo.findOne({
      where: {
        product: { id: product.id },
        displayShelf: { id: displayShelfId },
      },
    });

    let newDisplayProduct;

    if (existing) {
      // Trường hợp 1: Đang hiển thị -> Báo lỗi trùng
      if (existing.status === DisplayProductStatus.ACTIVE) {
        throw new BadRequestException(
          'Sản phẩm đã được trưng bày trên kệ này.',
        );
      }

      // Trường hợp 2: Đang ẩn (Inactive) -> Hồi sinh lại (Update thành Active)
      existing.status = DisplayProductStatus.ACTIVE;
      existing.quantity = quantity;
      existing.displayOrder =
        createDisplayProductDto.displayOrder ?? existing.displayOrder;

      newDisplayProduct = await displayProductRepo.save(existing);
    } else {
      // Trường hợp 3: Chưa có -> Tạo mới hoàn toàn
      const displayShelf = await this.findDisplayShelfByField(
        'id',
        displayShelfId,
        displayShelfRepo,
      );

      if (!displayShelf)
        throw new NotFoundException(
          `Không tìm thấy kệ có mã ID '${displayShelfId}'`,
        );

      newDisplayProduct = displayProductRepo.create({
        ...createDisplayProductDto,
        product,
        displayShelf,
        status: DisplayProductStatus.ACTIVE,
      });
      await displayProductRepo.save(newDisplayProduct);
    }

    // Trừ tồn kho
    product.inventory.availableQuantity -= createDisplayProductDto.quantity;
    product.inventory.displayQuantity += createDisplayProductDto.quantity;
    await inventoryRepo.save(product.inventory);

    await this.createNewDisplayLog(
      {
        displayProduct: newDisplayProduct,
        // [FIX LỖI TẠI ĐÂY]: Thêm "|| undefined" để convert null -> undefined
        shelf:
          (await this.findDisplayShelfByField(
            'id',
            displayShelfId,
            displayShelfRepo,
          )) || undefined,
        action: DisplayLogAction.ADD,
        employee,
        note: 'Thêm mới sản phẩm vào kệ trưng bày',
        quantity: createDisplayProductDto.quantity,
      },
      displayLogRepo,
    );

    return {
      message: `Sản phẩm đã được trưng bày trên kệ.`,
      data: await this.getDisplayProductDetail(
        userSession,
        newDisplayProduct.id,
      ),
    };
  }

  async getShelfs(userSession: TUserSession) {
    const { bookStoreId } = userSession;

    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const displayShelfRepo = dataSource.getRepository(DisplayShelf);

    return displayShelfRepo.find({
      where: {
        isActive: true,
      },
    });
  }

  async getShelfDetail(userSession: TUserSession, shelfId: string) {
    const { bookStoreId } = userSession;

    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const displayShelfRepo = dataSource.getRepository(DisplayShelf);

    const shelf = await displayShelfRepo.findOne({
      where: {
        id: shelfId,
      },
      relations: {
        displayProducts: {
          product: true,
        },
      },
    });

    if (!shelf)
      throw new NotFoundException(
        'Không tìm thấy thông tin trưng bày sản phẩm.',
      );

    // Lọc bỏ các sản phẩm Inactive khỏi danh sách chi tiết kệ
    shelf.displayProducts = shelf.displayProducts.filter(
      (dp) => dp.status === DisplayProductStatus.ACTIVE,
    );

    return shelf;
  }

  async updateShelf(
    userSession: TUserSession,
    shelfId: string,
    updateDisplayShelfDto: UpdateDisplayShelfDto,
  ) {
    const { bookStoreId } = userSession;

    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const shelfRepo = dataSource.getRepository(DisplayShelf);
    const displayLogRepo = dataSource.getRepository(DisplayLog);
    const employeeRepo = dataSource.getRepository(Employee);

    const employee = await employeeRepo.findOne({
      where: {
        id: userSession.userId,
      },
    });

    if (!employee)
      throw new NotFoundException(`Không tìm thấy thông tin của bạn.`);

    const shelf = await shelfRepo.findOne({
      where: {
        id: shelfId,
      },
    });

    if (!shelf) throw new NotFoundException('Không tìm thấy thông tin kệ sách');

    const { name, description } = updateDisplayShelfDto;
    shelf.name = name || shelf.name;
    shelf.description = description || shelf.description;
    await shelfRepo.save(shelf);

    await this.createNewDisplayLog(
      {
        shelf,
        action: DisplayLogAction.ADJUST,
        employee,
        note: 'Cập nhật thông tin kệ sách',
      },
      displayLogRepo,
    );

    return {
      message: 'Thông tin kệ sách đã được cập nhật.',
      data: await this.getShelfDetail(userSession, shelfId),
    };
  }

  async deleteShelf(userSession: TUserSession, shelfId: string) {
    const { bookStoreId } = userSession;

    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const shelfRepo = dataSource.getRepository(DisplayShelf);
    const displayLogRepo = dataSource.getRepository(DisplayLog);
    const inventoryRepo = dataSource.getRepository(Inventory);
    const employeeRepo = dataSource.getRepository(Employee);

    const employee = await employeeRepo.findOne({
      where: {
        id: userSession.userId,
      },
    });

    if (!employee)
      throw new NotFoundException(`Không tìm thấy thông tin của bạn.`);

    const shelf = await shelfRepo.findOne({
      where: {
        id: shelfId,
      },
      relations: {
        displayProducts: {
          product: {
            inventory: true,
          },
        },
      },
    });

    if (!shelf)
      throw new NotFoundException('Không tìm thấy thông tin kệ sách.');

    shelf.isActive = false;
    await shelfRepo.save(shelf);

    await this.createNewDisplayLog(
      {
        shelf,
        action: DisplayLogAction.REMOVE,
        employee,
        note: 'Xoá bỏ kệ sách',
      },
      displayLogRepo,
    );

    await Promise.all(
      shelf.displayProducts.map(async (dp) => {
        // Chỉ trả về kho nếu sản phẩm đang ACTIVE
        if (dp.status === DisplayProductStatus.ACTIVE) {
          const inventory = await inventoryRepo.findOne({
            where: {
              id: dp.product.inventory.id,
            },
          });

          if (inventory) {
            inventory.availableQuantity += dp.quantity;
            await inventoryRepo.save(inventory);
          }

          // Soft delete các sản phẩm trên kệ luôn
          const displayProductRepo = dataSource.getRepository(DisplayProduct);
          dp.status = DisplayProductStatus.INACTIVE;
          dp.quantity = 0;
          await displayProductRepo.save(dp);
        }
      }),
    );

    return {
      message: 'Kệ trưng bày đã được xoá thành công.',
    };
  }

  async getLogs(userSession: TUserSession, getLogsQueryDto: GetLogsQueryDto) {
    const { bookStoreId } = userSession;

    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const displayLogRepo = dataSource.getRepository(DisplayLog);

    const {
      displayShelfName,
      productName,
      productId,
      action,
      from,
      to,
      employeeId,
      employeeName,
    } = getLogsQueryDto;

    const qb = displayLogRepo
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.displayProduct', 'displayProduct')
      .leftJoinAndSelect('displayProduct.product', 'product')
      .leftJoinAndSelect('log.shelf', 'shelf')
      .leftJoinAndSelect('log.employee', 'employee')
      .orderBy('log.createdAt', 'DESC');

    const conditions = [
      [
        displayShelfName,
        'shelf.name ILIKE :displayShelfName',
        { displayShelfName: `%${displayShelfName}%` },
      ],
      [
        productName,
        'product.name ILIKE :productName',
        { productName: `%${productName}%` },
      ],
      [productId, 'product.id = :productId', { productId }],
      [action, 'log.action = :action', { action }],
      [from, 'log.createdAt >= :from', { from }],
      [to, 'log.createdAt <= :to', { to }],
      [employeeId, 'employee.id = :employeeId', { employeeId }],
      [
        employeeName,
        'employee.fullName ILIKE :employeeName',
        { employeeName: `%${employeeName}%` },
      ],
    ];

    conditions.forEach(
      ([value, query, params]: [any, string, Record<string, any>]) => {
        if (value) qb.andWhere(query, params);
      },
    );

    const logs = await qb.getMany();

    return logs.map((l) => ({
      ...l,
      employee: omit(l.employee, ['password']),
    }));
  }

  async getLogDetail(userSession: TUserSession, logId: string) {
    const { bookStoreId } = userSession;

    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const displayLogRepo = dataSource.getRepository(DisplayLog);

    const log = await displayLogRepo.findOne({
      where: {
        id: logId,
      },
      relations: {
        displayProduct: {
          product: true,
        },
        shelf: true,
        employee: true,
      },
    });

    if (!log)
      throw new NotFoundException(
        `Không tìm thấy thông tin của log có ID '${logId}'.`,
      );

    return omit(log, ['employee.password']);
  }

  async getDisplayProducts(
    userSession: TUserSession,
    query: GetDisplayProductsQueryDto,
  ) {
    const { bookStoreId } = userSession;

    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const displayProductRepo = dataSource.getRepository(DisplayProduct);

    const qb = displayProductRepo
      .createQueryBuilder('dp')
      .leftJoinAndSelect('dp.product', 'product')
      .leftJoinAndSelect('product.book', 'book')
      .leftJoinAndSelect('dp.displayShelf', 'shelf')
      .where('dp.status = :status', { status: DisplayProductStatus.ACTIVE });

    // 1. Filter theo Shelf ID (nếu có)
    if (query.displayShelfId) {
      qb.andWhere('shelf.id = :displayShelfId', {
        displayShelfId: query.displayShelfId,
      });
    }

    // 2. Filter theo Shelf Name
    if (query.displayShelfName) {
      qb.andWhere('shelf.name ILIKE :displayShelfName', {
        displayShelfName: `%${query.displayShelfName}%`,
      });
    }

    // 3. Filter theo Product ID
    if (query.productId) {
      qb.andWhere('product.id = :productId', { productId: query.productId });
    }

    // 4. Filter theo Product Name hoặc SKU
    if (query.productName) {
      qb.andWhere(
        '(product.name ILIKE :productName OR product.sku ILIKE :productName)',
        { productName: `%${query.productName}%` },
      );
    }

    // 5. Filter theo Status
    if (query.status) {
      qb.andWhere('dp.status = :queryStatus', { queryStatus: query.status });
    }

    const rangeFilters = [
      ['quantityMin', 'dp.quantity', '>='],
      ['quantityMax', 'dp.quantity', '<='],
      ['displayOrderMin', 'dp.displayOrder', '>='],
      ['displayOrderMax', 'dp.displayOrder', '<='],
    ] as const;

    for (const [key, field, op] of rangeFilters) {
      const value = query[key];
      if (value !== undefined) {
        qb.andWhere(`${field} ${op} :${key}`, { [key]: value });
      }
    }

    if (query.from) {
      qb.andWhere(`dp.createdAt >= :from`, { from: query.from });
    }

    if (query.to) {
      qb.andWhere(`dp.createdAt <= :to`, { to: query.to });
    }

    const sortMap = {
      'createdAt.asc': ['dp.createdAt', 'ASC'],
      'createdAt.desc': ['dp.createdAt', 'DESC'],
      'quantity.asc': ['dp.quantity', 'ASC'],
      'quantity.desc': ['dp.quantity', 'DESC'],
      'displayOrder.asc': ['dp.displayOrder', 'ASC'],
      'displayOrder.desc': ['dp.displayOrder', 'DESC'],
    };

    if (query.sort && sortMap[query.sort]) {
      const [field, direction] = sortMap[query.sort];
      qb.orderBy(field, direction as 'ASC' | 'DESC');
    } else {
      qb.orderBy('dp.createdAt', 'DESC');
    }

    return qb.getMany();
  }

  async getDisplayProductDetail(
    userSession: TUserSession,
    displayProductId: string,
  ) {
    const { bookStoreId } = userSession;

    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const displayProductRepo = dataSource.getRepository(DisplayProduct);

    const displayProduct = await displayProductRepo.findOne({
      where: {
        id: displayProductId,
      },
      relations: {
        product: {
          book: true,
        },
        displayShelf: true,
      },
    });

    if (!displayProduct)
      throw new NotFoundException(
        `Không tìm thấy trưng bày sản phẩm có mã ID '${displayProductId}'`,
      );

    return displayProduct;
  }

  async updateDisplayProduct(
    userSession: TUserSession,
    displayProductId: string,
    updateDisplayProductDto: UpdateDisplayProductDto,
  ) {
    const { bookStoreId } = userSession;

    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const displayProductRepo = dataSource.getRepository(DisplayProduct);
    const displayLogRepo = dataSource.getRepository(DisplayLog);
    const employeeRepo = dataSource.getRepository(Employee);

    const employee = await employeeRepo.findOne({
      where: {
        id: userSession.userId,
      },
    });

    if (!employee)
      throw new NotFoundException(`Không tìm thấy thông tin của bạn.`);

    const displayProduct = await displayProductRepo.findOne({
      where: {
        id: displayProductId,
      },
      relations: {
        product: {
          inventory: true,
        },
        displayShelf: true,
      },
    });

    if (!displayProduct)
      throw new NotFoundException(
        `Không tìm thấy trưng bày sản phẩm có mã ID '${displayProductId}'.`,
      );

    for (const key of Object.keys(
      omit(updateDisplayProductDto, ['quantity']),
    )) {
      if (updateDisplayProductDto[key] !== undefined) {
        displayProduct[key] = updateDisplayProductDto[key];
      }
    }

    if (updateDisplayProductDto?.quantity !== undefined) {
      const inventoryRepo = dataSource.getRepository(Inventory);
      const inventory = displayProduct.product.inventory;

      const newQty = updateDisplayProductDto.quantity;
      const oldQty = displayProduct.quantity;
      const delta = newQty - oldQty;

      if (delta > 0 && delta > inventory.availableQuantity) {
        throw new BadRequestException(
          'Số lượng thêm vượt quá tồn kho của sản phẩm.',
        );
      }

      if (delta !== 0) {
        inventory.availableQuantity -= delta;
        inventory.displayQuantity += delta;

        await inventoryRepo.save(inventory);

        displayProduct.quantity = newQty;
        await displayProductRepo.save(displayProduct);
      }
    }

    await this.createNewDisplayLog(
      {
        displayProduct,
        shelf: displayProduct.displayShelf,
        action: DisplayLogAction.ADJUST,
        employee,
        note: 'Cập nhật thông tin sản phẩm trưng bày',
        ...(updateDisplayProductDto?.quantity && {
          quantity:
            (updateDisplayProductDto?.quantity > displayProduct.quantity
              ? -1
              : 1) * updateDisplayProductDto.quantity,
        }),
      },
      displayLogRepo,
    );

    return {
      message: 'Cập nhật thông tin trưng bày thành công.',
      data: await displayProductRepo.save(displayProduct),
    };
  }

  // --- [UPDATED] Xóa mềm (Soft Delete) ---
  async deleteDisplayProductFromShelf(
    userSession: TUserSession,
    displayProductId: string,
  ) {
    const { bookStoreId } = userSession;

    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const displayProductRepo = dataSource.getRepository(DisplayProduct);
    const inventoryRepo = dataSource.getRepository(Inventory);
    const employeeRepo = dataSource.getRepository(Employee);

    const employee = await employeeRepo.findOne({
      where: {
        id: userSession.userId,
      },
    });

    if (!employee)
      throw new NotFoundException(`Không tìm thấy thông tin của bạn.`);

    const displayProduct = await displayProductRepo.findOne({
      where: {
        id: displayProductId,
      },
      relations: {
        product: true,
        displayShelf: true,
      },
    });

    if (!displayProduct)
      throw new NotFoundException(
        `Không tìm thấy trưng bày sản phẩm có mã ID '${displayProductId}'.`,
      );

    // Không dùng .delete() để tránh mất ID gây lỗi Log
    // await displayProductRepo.delete({ id: displayProductId }); <-- DELETE THIS LINE

    const inventory = await inventoryRepo.findOne({
      where: {
        product: {
          id: displayProduct.product.id,
        },
      },
    });

    if (inventory) {
      inventory.availableQuantity += displayProduct.quantity;
      await inventoryRepo.save(inventory);
    }

    // [FIX] Cập nhật trạng thái Inactive và số lượng 0
    displayProduct.quantity = 0;
    displayProduct.status = DisplayProductStatus.INACTIVE;
    await displayProductRepo.save(displayProduct);

    // Ghi log hoạt động bình thường vì ID vẫn còn trong DB
    await this.createNewDisplayLog(
      {
        displayProduct,
        shelf: displayProduct.displayShelf,
        action: DisplayLogAction.RETURN_TO_INVENTORY,
        employee,
        note: `Đã trả tất cả bản của sản phẩm "${displayProduct.product.name}" từ kệ "${displayProduct.displayShelf.name}" về kho.`,
        quantity: displayProduct.quantity,
      },
      dataSource.getRepository(DisplayLog),
    );

    return {
      message: `Sản phẩm trên kệ đã được xoá thành công và trả về kho.`,
    };
  }

  async reduceDisplayProductQuantity(
    userSession: TUserSession,
    displayProductId: string,
    reduceDisplayProductQuantityDto: ReduceDisplayProductQuantityDto,
  ) {
    const { bookStoreId } = userSession;

    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const displayProductRepo = dataSource.getRepository(DisplayProduct);
    const inventoryRepo = dataSource.getRepository(Inventory);
    const employeeRepo = dataSource.getRepository(Employee);

    const employee = await employeeRepo.findOne({
      where: {
        id: userSession.userId,
      },
    });

    if (!employee)
      throw new NotFoundException(`Không tìm thấy thông tin của bạn.`);

    const displayProduct = await displayProductRepo.findOne({
      where: {
        id: displayProductId,
      },
      relations: {
        product: true,
        displayShelf: true,
      },
    });

    if (!displayProduct)
      throw new NotFoundException(
        `Không tìm thấy sản phẩm trưng bày có mã ID '${displayProductId}'.`,
      );

    const { quantity } = reduceDisplayProductQuantityDto;

    if (quantity > displayProduct.quantity) {
      throw new BadRequestException(
        `Số lượng cần giảm (${quantity}) không được lớn hơn số lượng hiện có trên kệ (${displayProduct.quantity}).`,
      );
    }

    if (quantity === displayProduct.quantity)
      return this.deleteDisplayProductFromShelf(userSession, displayProductId);

    displayProduct.quantity -= quantity;
    await displayProductRepo.save(displayProduct);

    const inventory = await inventoryRepo.findOne({
      where: {
        product: {
          id: displayProduct.product.id,
        },
      },
    });

    if (!inventory)
      throw new NotFoundException('Tồn kho của sản phẩm không tồn tại.');

    inventory.availableQuantity += reduceDisplayProductQuantityDto.quantity;
    await inventoryRepo.save(inventory);

    await this.createNewDisplayLog(
      {
        displayProduct,
        shelf: displayProduct.displayShelf,
        action: DisplayLogAction.RETURN_TO_INVENTORY,
        employee,
        note: `Đã trả ${reduceDisplayProductQuantityDto.quantity} bản của sản phẩm "${displayProduct.product.name}" từ kệ "${displayProduct.displayShelf.name}" về kho.`,
        quantity: reduceDisplayProductQuantityDto.quantity,
      },
      dataSource.getRepository(DisplayLog),
    );

    return {
      message: `Đã trả thành công ${reduceDisplayProductQuantityDto.quantity} bản về kho.`,
    };
  }

  // --- [UPDATED] Sửa lỗi relations cho Move ---
  async moveDisplayProduct(
    userSession: TUserSession,
    displayProductId: string,
    moveDisplayProductDto: MoveDisplayProductDto,
  ) {
    const { bookStoreId } = userSession;

    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const displayProductRepo = dataSource.getRepository(DisplayProduct);
    const displayShelfRepo = dataSource.getRepository(DisplayShelf);
    const employeeRepo = dataSource.getRepository(Employee);

    const employee = await employeeRepo.findOne({
      where: {
        id: userSession.userId,
      },
    });

    if (!employee)
      throw new NotFoundException(`Không tìm thấy thông tin của bạn.`);

    const displayProduct = await displayProductRepo.findOne({
      where: {
        id: displayProductId,
      },
      relations: {
        product: {
          inventory: true,
        },
        displayShelf: true,
      },
    });

    if (!displayProduct)
      throw new NotFoundException(
        `Không tìm thấy sản phẩm trưng bày có ID '${displayProductId}'.`,
      );

    const { targetShelfId, quantity } = moveDisplayProductDto;

    if (quantity && quantity > displayProduct.quantity) {
      throw new BadRequestException(
        `Số lượng cần di chuyển (${quantity}) không được lớn hơn số lượng hiện có trên kệ (${displayProduct.quantity})`,
      );
    }

    const targetShelf = await displayShelfRepo.findOne({
      where: {
        id: targetShelfId,
      },
      relations: {
        displayProducts: {
          product: true, // [FIX] QUAN TRỌNG: Load thông tin Product để check ID
        },
      },
    });

    if (!targetShelf)
      throw new NotFoundException(
        `Không tìm thấy thông tin kệ cần chuyến đến.`,
      );

    const moveQty = quantity ?? displayProduct.quantity;

    // Check item tồn tại ở kệ đích (bao gồm cả Active)
    let targetDP = targetShelf.displayProducts.find(
      (dp) =>
        dp.product.id === displayProduct.product.id &&
        dp.status === DisplayProductStatus.ACTIVE,
    );

    // Nếu chưa thấy Active, tìm thử Inactive để Revive (Hồi sinh) cho clean
    if (!targetDP) {
      targetDP = targetShelf.displayProducts.find(
        (dp) => dp.product.id === displayProduct.product.id,
      );
      if (targetDP) {
        // Found inactive one, reviving it
        targetDP.status = DisplayProductStatus.ACTIVE;
        targetDP.quantity = 0; // Reset to 0 before adding
      }
    }

    if (targetDP) {
      targetDP.quantity += moveQty;
      await displayProductRepo.save(targetDP);
    } else {
      targetDP = displayProductRepo.create({
        product: displayProduct.product,
        displayShelf: targetShelf,
        quantity: moveQty,
        status: displayProduct.status,
        displayOrder: displayProduct.displayOrder,
      });
      await displayProductRepo.save(targetDP);
    }

    displayProduct.quantity -= moveQty;

    // Soft delete ở kệ nguồn nếu hết hàng
    if (displayProduct.quantity <= 0) {
      displayProduct.status = DisplayProductStatus.INACTIVE;
      displayProduct.quantity = 0;
    }

    await displayProductRepo.save(displayProduct);

    await this.createNewDisplayLog(
      {
        quantity: moveQty,
        displayProduct,
        shelf: targetShelf,
        action: DisplayLogAction.MOVE,
        employee,
        note: `Đã di chuyển ${moveQty} bản của sản phẩm "${displayProduct.product.name}" từ kệ "${displayProduct.displayShelf.name}" sang kệ "${targetShelf.name}"`,
      },
      dataSource.getRepository(DisplayLog),
    );

    return {
      message: `Đã di chuyển thành công ${moveQty} bản.`,
      data: await this.getDisplayProductDetail(userSession, targetDP.id),
    };
  }

  private async createNewDisplayLog(
    createNewDisplayLog: Partial<DisplayLog>,
    repo: Repository<DisplayLog>,
  ) {
    const newDisplayLog = repo.create(createNewDisplayLog);
    await repo.save(newDisplayLog);
  }
}
