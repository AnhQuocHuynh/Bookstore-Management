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
import {
  BookStatus,
  DisplayLogAction,
  DisplayLogActorType,
} from '@/common/enums';
import { TUserSession } from '@/common/utils';
import { MainUserService } from '@/database/main/services/main-user.service';
import {
  Book,
  DisplayLog,
  DisplayProduct,
  DisplayShelf,
  Employee,
  Inventory,
} from '@/database/tenant/entities';
import { UserRole } from '@/modules/users/enums';
import { TenantService } from '@/tenants/tenant.service';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class DisplayService {
  constructor(
    private readonly tenantService: TenantService,
    private readonly mainUserService: MainUserService,
  ) {}

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
      throw new ConflictException(`Display self ${name} has been existed.`);

    const newDisplaySelf = displaySelfRepo.create(createDisplaySelfDto);
    return displaySelfRepo.save(newDisplaySelf);
  }

  async createDisplayProduct(
    createDisplayProductDto: CreateDisplayProductDto,
    userSession: TUserSession,
  ) {
    const { bookStoreId, userId, role } = userSession;

    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const { bookId, displayShelfId, quantity } = createDisplayProductDto;
    const displayProductRepo = dataSource.getRepository(DisplayProduct);
    const bookRepo = dataSource.getRepository(Book);
    const displayShelfRepo = dataSource.getRepository(DisplayShelf);
    const inventoryRepo = dataSource.getRepository(Inventory);
    const displayLogRepo = dataSource.getRepository(DisplayLog);

    const book = await bookRepo.findOne({
      where: {
        id: bookId,
      },
      relations: {
        inventory: true,
      },
    });

    if (!book) throw new NotFoundException(`Book with id ${bookId} not found.`);

    if (book.status !== BookStatus.AVAILABLE) {
      throw new BadRequestException(
        'Cannot display a book that is not available',
      );
    }

    if (book.inventory.available < quantity) {
      throw new BadRequestException('Not enough inventory to display.');
    }

    const existing = await displayProductRepo.findOne({
      where: {
        book: { id: book.id },
        displayShelf: { id: displayShelfId },
      },
    });

    if (existing) {
      throw new BadRequestException('Book already displayed on this shelf');
    }

    const displayShelf = await this.findDisplayShelfByField(
      'id',
      displayShelfId,
      displayShelfRepo,
    );

    if (!displayShelf)
      throw new NotFoundException(
        `Display self with id ${displayShelfId} not found.`,
      );

    const newDisplayProduct = displayProductRepo.create({
      ...createDisplayProductDto,
      book,
      displayShelf,
    });
    await displayProductRepo.save(newDisplayProduct);

    book.inventory.available -= createDisplayProductDto.quantity;
    await inventoryRepo.save(book.inventory);

    await this.createNewDisplayLog(
      {
        book,
        shelf: displayShelf,
        action: DisplayLogAction.ADD,
        actorId: userId,
        actorType:
          role === UserRole.EMPLOYEE
            ? DisplayLogActorType.EMPLOYEE
            : DisplayLogActorType.OWNER,
        note: 'Create new display product',
        quantity: createDisplayProductDto.quantity,
      },
      displayLogRepo,
    );

    return {
      message: `Product has been display in the shelf.`,
      data: newDisplayProduct,
    };
  }

  async getShelfs(userSession: TUserSession) {
    const { bookStoreId } = userSession;

    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const displayShelfRepo = dataSource.getRepository(DisplayShelf);

    return displayShelfRepo.find();
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
          book: true,
        },
      },
    });

    if (!shelf) throw new NotFoundException('Shelf not found.');

    return self;
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

    const shelf = await shelfRepo.findOne({
      where: {
        id: shelfId,
      },
    });

    if (!shelf) throw new NotFoundException('Shelf not found.');

    const { name, description } = updateDisplayShelfDto;
    shelf.name = name || shelf.name;
    shelf.description = description || shelf.description;
    await shelfRepo.save(shelf);

    await this.createNewDisplayLog(
      {
        shelf,
        action: DisplayLogAction.ADJUST,
        actorId: userSession.userId,
        actorType:
          userSession.role === UserRole.EMPLOYEE
            ? DisplayLogActorType.EMPLOYEE
            : DisplayLogActorType.OWNER,
        note: 'Update display shelf',
      },
      displayLogRepo,
    );

    return {
      message: 'Shelf has been updated successfully.',
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

    const shelf = await shelfRepo.findOne({
      where: {
        id: shelfId,
      },
      relations: {
        displayProducts: {
          book: {
            inventory: true,
          },
        },
      },
    });

    if (!shelf) throw new NotFoundException('Shelf not found.');

    await shelfRepo.delete({
      id: shelfId,
    });

    await this.createNewDisplayLog(
      {
        shelf,
        action: DisplayLogAction.REMOVE,
        actorId: userSession.userId,
        actorType:
          userSession.role === UserRole.EMPLOYEE
            ? DisplayLogActorType.EMPLOYEE
            : DisplayLogActorType.OWNER,
        note: 'Delete shelf',
      },
      displayLogRepo,
    );

    await Promise.all(
      shelf.displayProducts.map(async (dp) => {
        const inventory = await inventoryRepo.findOne({
          where: {
            id: dp.book.inventory.id,
          },
        });

        if (inventory) {
          inventory.available += dp.quantity;
          await inventoryRepo.save(inventory);
        }
      }),
    );

    return {
      message: 'Display shelf has been deleted successfully.',
    };
  }

  async getLogs(userSession: TUserSession, getLogsQueryDto: GetLogsQueryDto) {
    const { bookStoreId } = userSession;

    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const displayLogRepo = dataSource.getRepository(DisplayLog);
    const employeeRepo = dataSource.getRepository(Employee);

    const { displayShelfName, bookTitle, bookId, actorId, type, from, to } =
      getLogsQueryDto;

    const qb = displayLogRepo
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.book', 'book')
      .leftJoinAndSelect('log.shelf', 'shelf')
      .orderBy('log.createdAt', 'DESC');

    const conditions = [
      [
        displayShelfName,
        'shelf.name ILIKE :displayShelfName',
        { displayShelfName: `%${displayShelfName}%` },
      ],
      [
        bookTitle,
        'book.title ILIKE :bookTitle',
        { bookTitle: `%${bookTitle}%` },
      ],
      [bookId, 'book.id = :bookId', { bookId }],
      [actorId, 'actor.id = :actorId', { actorId }],
      [type, 'log.type = :type', { type }],
      [from, 'log.createdAt >= :from', { from }],
      [to, 'log.createdAt <= :to', { to }],
    ];

    conditions.forEach(
      ([value, query, params]: [any, string, Record<string, any>]) => {
        if (value) qb.andWhere(query, params);
      },
    );

    const logs = await qb.getMany();

    const ownerIds = logs
      .filter((l) => l.actorType === DisplayLogActorType.OWNER)
      .map((l) => l.actorId);

    const employeeIds = logs
      .filter((l) => l.actorType === DisplayLogActorType.EMPLOYEE)
      .map((l) => l.actorId);

    const ownerMap =
      ownerIds.length > 0
        ? await this.mainUserService.getUseByIds(ownerIds)
        : {};

    let employees: Employee[] = [];
    if (employeeIds.length > 0) {
      employees = await employeeRepo
        .createQueryBuilder('employee')
        .where('employee.id IN (:...employeeIds)', { employeeIds })
        .leftJoinAndSelect('employee.user', 'user')
        .getMany();
    }

    const employeeMap: { [id: string]: Employee } = {};
    for (const employee of employees) {
      employeeMap[employee.userId] = employee;
    }

    return logs.map((l) => ({
      ...l,
      actorName:
        l.actorType === DisplayLogActorType.OWNER
          ? (ownerMap[l.actorId]?.fullName ?? 'Unknown')
          : (employeeMap[l.actorId]?.user?.fullName ?? 'Unknown'),
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
        book: true,
        shelf: true,
      },
    });

    if (!log) throw new NotFoundException(`Log ${logId} not found.`);

    let actorName = 'Unknown';
    if (log.actorType === DisplayLogActorType.OWNER) {
      const owner = await this.mainUserService.getUseByIds([log.actorId]);
      actorName = owner[log.actorId]?.fullName ?? 'Unknown';
    } else if (log.actorType === DisplayLogActorType.EMPLOYEE) {
      const employee = await dataSource
        .getRepository(Employee)
        .createQueryBuilder('employee')
        .leftJoinAndSelect('employee.user', 'user')
        .where('employee.id = :id', { id: log.actorId })
        .getOne();

      actorName = employee?.user?.fullName ?? 'Unknown';
    }

    return {
      ...log,
      actorName,
    };
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
      .leftJoinAndSelect('dp.book', 'book')
      .leftJoinAndSelect('dp.displayShelf', 'shelf');

    const simpleFilters = {
      displayShelfId: ['shelf.id', '='],
      displayShelfName: ['shelf.name', 'LIKE'],
      bookId: ['book.id', '='],
      bookTitle: ['book.title', 'LIKE'],
      status: ['dp.status', '='],
    };

    for (const key in simpleFilters) {
      const value = query[key];
      if (!value) continue;

      const [field, op] = simpleFilters[key];

      if (op === 'LIKE') {
        qb.andWhere(`${field} LIKE :${key}`, { [key]: `%${value}%` });
      } else {
        qb.andWhere(`${field} = :${key}`, { [key]: value });
      }
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
        book: true,
        displayShelf: true,
      },
    });

    if (!displayProduct)
      throw new NotFoundException(
        `Display product ${displayProductId} not found.`,
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

    const displayProduct = await displayProductRepo.findOne({
      where: {
        id: displayProductId,
      },
      relations: {
        book: true,
        displayShelf: true,
      },
    });

    if (!displayProduct)
      throw new NotFoundException(
        `Display product ${displayProductId} not found.`,
      );

    for (const key of Object.keys(updateDisplayProductDto)) {
      if (updateDisplayProductDto[key] !== undefined) {
        displayProduct[key] = updateDisplayProductDto[key];
      }
    }

    await this.createNewDisplayLog(
      {
        book: displayProduct.book,
        shelf: displayProduct.displayShelf,
        action: DisplayLogAction.ADJUST,
        actorId: userSession.userId,
        actorType:
          userSession.role === UserRole.EMPLOYEE
            ? DisplayLogActorType.EMPLOYEE
            : DisplayLogActorType.OWNER,
        note: 'Update display product',
        ...(updateDisplayProductDto?.quantity && {
          quantity: updateDisplayProductDto.quantity,
        }),
      },
      displayLogRepo,
    );

    return displayProductRepo.save(displayProduct);
  }

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

    const displayProduct = await displayProductRepo.findOne({
      where: {
        id: displayProductId,
      },
      relations: {
        book: true,
        displayShelf: true,
      },
    });

    if (!displayProduct)
      throw new NotFoundException(
        `Display product ${displayProductId} not found.`,
      );

    await displayProductRepo.delete({ id: displayProductId });

    const inventory = await inventoryRepo.findOne({
      where: {
        book: {
          id: displayProduct.book.id,
        },
      },
    });

    if (inventory) {
      inventory.available += displayProduct.quantity;
      await inventoryRepo.save(inventory);
    }

    await this.createNewDisplayLog(
      {
        book: displayProduct.book,
        shelf: displayProduct.displayShelf,
        action: DisplayLogAction.RETURN_TO_INVENTORY,
        actorId: userSession.userId,
        actorType:
          userSession.role === UserRole.EMPLOYEE
            ? DisplayLogActorType.EMPLOYEE
            : DisplayLogActorType.OWNER,
        note: `Returned all (${displayProduct.quantity}) copies of "${displayProduct.book.title}" from shelf "${displayProduct.displayShelf.name}" to inventory`,
        quantity: displayProduct.quantity,
      },
      dataSource.getRepository(DisplayLog),
    );

    return {
      message: `The display product has been successfully deleted and returned to inventory.`,
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

    const displayProduct = await displayProductRepo.findOne({
      where: {
        id: displayProductId,
      },
      relations: {
        book: true,
        displayShelf: true,
      },
    });

    if (!displayProduct)
      throw new NotFoundException(
        `Display product ${displayProductId} not found.`,
      );

    const { quantity } = reduceDisplayProductQuantityDto;

    if (quantity > displayProduct.quantity) {
      throw new BadRequestException(
        `The quantity to remove (${quantity}) cannot be greater than the current quantity on the shelf (${displayProduct.quantity}).`,
      );
    }

    if (quantity === displayProduct.quantity)
      return this.deleteDisplayProductFromShelf(userSession, displayProductId);

    displayProduct.quantity -= quantity;
    await displayProductRepo.save(displayProduct);

    const inventory = await inventoryRepo.findOne({
      where: {
        book: {
          id: displayProduct.book.id,
        },
      },
    });

    if (!inventory) throw new NotFoundException('Inventory of book not found.');

    inventory.available += reduceDisplayProductQuantityDto.quantity;
    await inventoryRepo.save(inventory);

    await this.createNewDisplayLog(
      {
        book: displayProduct.book,
        shelf: displayProduct.displayShelf,
        action: DisplayLogAction.RETURN_TO_INVENTORY,
        actorId: userSession.userId,
        actorType:
          userSession.role === UserRole.EMPLOYEE
            ? DisplayLogActorType.EMPLOYEE
            : DisplayLogActorType.OWNER,
        note: `Returned ${reduceDisplayProductQuantityDto.quantity} copies of "${displayProduct.book.title}" from shelf "${displayProduct.displayShelf.name}" to inventory`,
        quantity: reduceDisplayProductQuantityDto.quantity,
      },
      dataSource.getRepository(DisplayLog),
    );

    return {
      message: `Successfully returned ${reduceDisplayProductQuantityDto.quantity} copies to inventory.`,
    };
  }

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

    const displayProduct = await displayProductRepo.findOne({
      where: {
        id: displayProductId,
      },
      relations: {
        book: {
          inventory: true,
        },
        displayShelf: true,
      },
    });

    if (!displayProduct)
      throw new NotFoundException(
        `Display product ${displayProductId} not found.`,
      );

    const { targetShelfId, quantity } = moveDisplayProductDto;

    if (quantity && quantity > displayProduct.quantity) {
      throw new BadRequestException(
        `The quantity to move (${quantity}) cannot be greater than the current quantity on the shelf (${displayProduct.quantity}).`,
      );
    }

    const targetShelf = await displayShelfRepo.findOne({
      where: {
        id: targetShelfId,
      },
      relations: {
        displayProducts: true,
      },
    });

    if (!targetShelf)
      throw new NotFoundException(`Target shelf ${targetShelfId} not found.`);

    const moveQty = quantity ?? displayProduct.quantity;

    let targetDP = targetShelf.displayProducts.find(
      (dp) => dp.book.id === displayProduct.book.id,
    );

    if (targetDP) {
      targetDP.quantity += moveQty;
      await displayProductRepo.save(targetDP);
    } else {
      const newDP = displayProductRepo.create({
        book: displayProduct.book,
        displayShelf: targetShelf,
        quantity: moveQty,
        status: displayProduct.status,
        displayOrder: displayProduct.displayOrder,
      });
      await displayProductRepo.save(newDP);
    }

    displayProduct.quantity -= moveQty;

    if (displayProduct.quantity <= 0) {
      await displayProductRepo.remove(displayProduct);
    } else {
      await displayProductRepo.save(displayProduct);
    }

    await this.createNewDisplayLog(
      {
        quantity: moveQty,
        book: displayProduct.book,
        shelf: targetShelf,
        action: DisplayLogAction.MOVE,
        actorId: userSession.userId,
        actorType:
          userSession.role === UserRole.EMPLOYEE
            ? DisplayLogActorType.EMPLOYEE
            : DisplayLogActorType.OWNER,
        note: `Moved ${moveQty} copies of "${displayProduct.book.title}" from shelf "${displayProduct.displayShelf.name}" to shelf "${targetShelf.name}"`,
      },
      dataSource.getRepository(DisplayLog),
    );

    return {
      message: `Successfully moved ${moveQty} copies.`,
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
