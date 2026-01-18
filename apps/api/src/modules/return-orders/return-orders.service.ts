import {
  AddReturnOrderDetailDto,
  CreateReturnOrderDto,
  RejectReturnOrderDto,
  UpdateReturnOrderDetailDto,
} from '@/common/dtos';
import { GetReturnOrdersQueryDto } from '@/common/dtos/return-orders/get-return-orders-query.dto';
import {
  InventoryLogAction,
  ReturnExchangeDetailStatus,
  ReturnExchangeDetailType,
  ReturnOrderStatus,
} from '@/common/enums';
import { TUserSession } from '@/common/utils';
import {
  Customer,
  Employee,
  Inventory,
  InventoryLog,
  Product,
  ReturnOrder,
  ReturnOrderDetail,
  Transaction,
} from '@/database/tenant/entities';
import { TenantService } from '@/tenants/tenant.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import Decimal from 'decimal.js';
import { omit } from 'lodash';
import { EntityManager, FindOptionsRelations } from 'typeorm';

@Injectable()
export class ReturnOrdersService {
  constructor(private readonly tenantService: TenantService) {}

  async deleteReturnOrder(bookStoreId: string, id: string) {
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const returnOrderRepo = dataSource.getRepository(ReturnOrder);

    const returnOrder = await returnOrderRepo.findOne({
      where: {
        id,
      },
    });

    if (!returnOrder) {
      throw new NotFoundException('Không tìm thấy thông tin đơn trả/đổi hàng.');
    }

    await returnOrderRepo.delete({ id });

    return {
      message: 'Đã xoá đơn trả/đổi hàng thành công.',
    };
  }

  async getReturnOrders(
    bookStoreId: string,
    getReturnOrdersQueryDto: GetReturnOrdersQueryDto,
  ) {
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const returnOrderRepo = dataSource.getRepository(ReturnOrder);

    const {
      status,
      employeeName,
      employeeEmail,
      customerName,
      customerEmail,
      minTotalRefundAmount,
      maxTotalRefundAmount,
      fromCreatedAt,
      toCreatedAt,
    } = getReturnOrdersQueryDto;

    const qb = returnOrderRepo
      .createQueryBuilder('ro')
      .leftJoinAndSelect('ro.employee', 'employee')
      .leftJoinAndSelect('ro.customer', 'customer')
      .leftJoinAndSelect('ro.details', 'details')
      .leftJoinAndSelect('ro.transaction', 'transaction');

    if (status) {
      qb.andWhere('ro.status = :status', { status });
    }

    if (employeeName) {
      qb.andWhere('employee.fullName ILIKE :employeeName', {
        employeeName: `%${employeeName}%`,
      });
    }

    if (employeeEmail) {
      qb.andWhere('employee.email ILIKE :employeeEmail', {
        employeeEmail: `%${employeeEmail}%`,
      });
    }

    if (customerName) {
      qb.andWhere('customer.fullName ILIKE :customerName', {
        customerName: `%${customerName}%`,
      });
    }

    if (customerEmail) {
      qb.andWhere('customer.email ILIKE :customerEmail', {
        customerEmail: `%${customerEmail}%`,
      });
    }

    if (minTotalRefundAmount) {
      qb.andWhere('ro.totalRefundAmount >= :minTotalRefundAmount', {
        minTotalRefundAmount,
      });
    }

    if (maxTotalRefundAmount) {
      qb.andWhere('ro.totalRefundAmount <= :maxTotalRefundAmount', {
        maxTotalRefundAmount,
      });
    }

    if (fromCreatedAt) {
      qb.andWhere('ro.createdAt >= :fromCreatedAt', {
        fromCreatedAt: new Date(fromCreatedAt),
      });
    }

    if (toCreatedAt) {
      qb.andWhere('ro.createdAt <= :toCreatedAt', {
        toCreatedAt: new Date(toCreatedAt),
      });
    }

    const result = await qb.orderBy('ro.createdAt', 'DESC').getMany();

    return result.map((r) => ({
      ...r,
      employee: omit(r.employee, ['password']),
    }));
  }

  private async findReturnOrderById(
    manager: EntityManager,
    id: string,
    relations?: FindOptionsRelations<ReturnOrder>,
  ) {
    const repo = manager.getRepository(ReturnOrder);
    const record = await repo.findOne({
      where: { id },
      ...(relations && { relations }),
    });

    return record ?? null;
  }

  private ensureEditable(order: ReturnOrder) {
    if (
      order.status === ReturnOrderStatus.APPROVED ||
      order.status === ReturnOrderStatus.REJECTED
    ) {
      throw new BadRequestException(
        'Đơn trả/đổi hàng đã được duyệt hoặc từ chối, không thể chỉnh sửa.',
      );
    }
  }

  private ensureDetailEditable(detail: ReturnOrderDetail) {
    if (
      detail.status === ReturnExchangeDetailStatus.APPROVED ||
      detail.status === ReturnExchangeDetailStatus.REJECTED
    ) {
      throw new BadRequestException(
        'Detail cannot be modified once approved or rejected.',
      );
    }
  }

  private async recalcTotalRefund(
    manager: EntityManager,
    returnOrderId: string,
  ) {
    const detailRepo = manager.getRepository(ReturnOrderDetail);
    const orderRepo = manager.getRepository(ReturnOrder);

    const details = await detailRepo.find({
      where: { returnOrder: { id: returnOrderId } },
      select: ['refundAmount'],
    });

    const total = details.reduce(
      (sum, d) => new Decimal(sum).add(d.refundAmount).toNumber(),
      0,
    );

    await orderRepo.update({ id: returnOrderId }, { totalRefundAmount: total });

    return total;
  }

  private async ensureEmployee(manager: EntityManager, userId: string) {
    const employeeRepo = manager.getRepository(Employee);
    const employee = await employeeRepo.findOne({
      where: { id: userId },
    });

    if (!employee) {
      throw new NotFoundException('Không tìm thấy thông tin của bạn.');
    }

    return employee;
  }

  async createReturnOrder(
    dto: CreateReturnOrderDto,
    userSession: TUserSession,
  ) {
    const { bookStoreId, userId } = userSession;

    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    return dataSource.transaction(async (manager) => {
      const returnOrderRepo = manager.getRepository(ReturnOrder);
      const transactionRepo = manager.getRepository(Transaction);
      const customerRepo = manager.getRepository(Customer);

      const transaction = await transactionRepo.findOne({
        where: { id: dto.transactionId },
        relations: { cashier: true },
      });

      if (!transaction) {
        throw new NotFoundException('Không tìm thấy giao dịch.');
      }

      if (!transaction.isCompleted) {
        throw new BadRequestException('Giao dịch chưa được hoàn tất.');
      }

      const customer = await customerRepo.findOne({
        where: { id: dto.customerId },
      });

      if (!customer) {
        throw new NotFoundException('Không tìm thấy khách hàng.');
      }

      const employee = await this.ensureEmployee(manager, userId);

      const newOrder = returnOrderRepo.create({
        transaction,
        customer,
        employee,
        ...(dto.note?.trim() && { note: dto.note }),
        status: ReturnOrderStatus.PENDING,
        totalRefundAmount: 0,
      });

      await returnOrderRepo.save(newOrder);

      return this.findReturnOrderById(manager, newOrder.id, {
        transaction: true,
        customer: true,
        employee: true,
        details: {
          newProduct: true,
        },
      });
    });
  }

  async getReturnOrderById(id: string, bookStoreId: string) {
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });
    const manager = dataSource.manager;

    const order = await this.findReturnOrderById(manager, id, {
      transaction: true,
      customer: true,
      employee: true,
      details: {
        newProduct: true,
      },
    });

    if (!order) throw new NotFoundException('Không tìm thấy yêu cầu trả hàng.');

    return order;
  }

  async addDetail(
    returnOrderId: string,
    dto: AddReturnOrderDetailDto,
    bookStoreId: string,
  ) {
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    return dataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository(ReturnOrder);
      const detailRepo = manager.getRepository(ReturnOrderDetail);
      const productRepo = manager.getRepository(Product);

      const order = await this.findReturnOrderById(manager, returnOrderId, {
        details: true,
      });

      if (!order) throw new NotFoundException('Không tìm thấy yêu cầu trả.');

      this.ensureEditable(order);

      let newProduct: Product | null = null;
      if (dto.type === ReturnExchangeDetailType.EXCHANGE) {
        newProduct = await productRepo.findOne({
          where: { id: dto.newProductId },
          relations: { inventory: true },
        });

        if (!newProduct) {
          throw new NotFoundException('Không tìm thấy sản phẩm đổi.');
        }
      }

      const newDetail = detailRepo.create({
        returnOrder: order,
        type: dto.type,
        quantity: dto.quantity,
        refundAmount: dto.refundAmount,
        ...(dto.reason?.trim() && { reason: dto.reason }),
        ...(newProduct && { newProduct }),
        status: ReturnExchangeDetailStatus.PENDING,
      });

      await detailRepo.save(newDetail);
      await this.recalcTotalRefund(manager, order.id);

      return this.findReturnOrderById(manager, order.id, {
        details: {
          newProduct: true,
        },
        transaction: true,
        customer: true,
        employee: true,
      });
    });
  }

  async updateDetail(
    returnOrderId: string,
    detailId: string,
    dto: UpdateReturnOrderDetailDto,
    bookStoreId: string,
  ) {
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    return dataSource.transaction(async (manager) => {
      const detailRepo = manager.getRepository(ReturnOrderDetail);
      const productRepo = manager.getRepository(Product);

      const detail = await detailRepo.findOne({
        where: { id: detailId },
        relations: {
          returnOrder: true,
          newProduct: true,
        },
      });

      if (!detail || detail.returnOrder.id !== returnOrderId) {
        throw new NotFoundException('Không tìm thấy chi tiết cần cập nhật.');
      }

      this.ensureEditable(detail.returnOrder);
      this.ensureDetailEditable(detail);

      if (dto.quantity !== undefined) {
        detail.quantity = dto.quantity;
      }

      if (dto.refundAmount !== undefined) {
        detail.refundAmount = dto.refundAmount;
      }

      if (dto.reason !== undefined) {
        detail.reason = dto.reason?.trim() ? dto.reason : undefined;
      }

      if (detail.type === ReturnExchangeDetailType.EXCHANGE) {
        const newProductId = dto.newProductId ?? detail.newProduct?.id;

        if (!newProductId) {
          throw new BadRequestException(
            'Sản phẩm đổi mới là bắt buộc cho loại đổi.',
          );
        }

        const newProduct = await productRepo.findOne({
          where: { id: newProductId },
          relations: { inventory: true },
        });

        if (!newProduct) {
          throw new NotFoundException('Không tìm thấy sản phẩm đổi.');
        }

        detail.newProduct = newProduct;
      } else if (dto.newProductId !== undefined) {
        detail.newProduct = undefined;
      }

      await detailRepo.save(detail);
      await this.recalcTotalRefund(manager, returnOrderId);

      return this.findReturnOrderById(manager, returnOrderId, {
        details: {
          newProduct: true,
        },
        transaction: true,
        customer: true,
        employee: true,
      });
    });
  }

  async deleteDetail(
    returnOrderId: string,
    detailId: string,
    bookStoreId: string,
  ) {
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    return dataSource.transaction(async (manager) => {
      const detailRepo = manager.getRepository(ReturnOrderDetail);

      const detail = await detailRepo.findOne({
        where: { id: detailId },
        relations: { returnOrder: true },
      });

      if (!detail || detail.returnOrder.id !== returnOrderId) {
        throw new NotFoundException('Không tìm thấy chi tiết cần xoá.');
      }

      this.ensureEditable(detail.returnOrder);
      this.ensureDetailEditable(detail);

      await detailRepo.delete({ id: detailId });
      await this.recalcTotalRefund(manager, returnOrderId);

      return this.findReturnOrderById(manager, returnOrderId, {
        details: { newProduct: true },
        transaction: true,
        customer: true,
        employee: true,
      });
    });
  }

  async recalculateTotal(returnOrderId: string, bookStoreId: string) {
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    return dataSource.transaction(async (manager) => {
      const order = await this.findReturnOrderById(manager, returnOrderId);
      if (!order) {
        throw new NotFoundException('Không tìm thấy yêu cầu trả hàng.');
      }

      const total = await this.recalcTotalRefund(manager, returnOrderId);
      return {
        totalRefundAmount: total,
      };
    });
  }

  async rejectReturnOrder(
    returnOrderId: string,
    dto: RejectReturnOrderDto,
    bookStoreId: string,
  ) {
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    return dataSource.transaction(async (manager) => {
      const order = await this.findReturnOrderById(manager, returnOrderId, {
        details: true,
      });

      if (!order) throw new NotFoundException('Không tìm thấy yêu cầu trả.');

      this.ensureEditable(order);

      order.status = ReturnOrderStatus.REJECTED;
      order.note = dto.note?.trim() ? dto.note : order.note;

      order.details?.forEach((d) => {
        d.status = ReturnExchangeDetailStatus.REJECTED;
      });

      await manager.getRepository(ReturnOrder).save(order);
      if (order.details?.length) {
        await manager.getRepository(ReturnOrderDetail).save(order.details);
      }

      return this.findReturnOrderById(manager, order.id, {
        details: { newProduct: true },
        transaction: true,
        customer: true,
        employee: true,
      });
    });
  }

  async approveReturnOrder(returnOrderId: string, userSession: TUserSession) {
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId: userSession.bookStoreId,
    });

    return dataSource.transaction(async (manager) => {
      const order = await this.findReturnOrderById(manager, returnOrderId, {
        details: {
          newProduct: { inventory: true },
        },
      });

      if (!order) throw new NotFoundException('Không tìm thấy yêu cầu trả.');

      this.ensureEditable(order);

      for (const detail of order.details ?? []) {
        this.ensureDetailEditable(detail);

        if (detail.type === ReturnExchangeDetailType.EXCHANGE) {
          if (!detail.newProduct) {
            throw new BadRequestException('Chi tiết đổi phải có sản phẩm mới.');
          }

          const inventoryRepo = manager.getRepository(Inventory);
          const inventoryLogRepo = manager.getRepository(InventoryLog);
          const employee = await this.ensureEmployee(
            manager,
            userSession.userId,
          );

          const inventory = await inventoryRepo.findOne({
            where: { id: detail.newProduct.inventory.id },
          });

          if (!inventory) {
            throw new NotFoundException('Không tìm thấy tồn kho sản phẩm đổi.');
          }

          if (inventory.availableQuantity < detail.quantity) {
            throw new BadRequestException(
              'Tồn kho sản phẩm đổi không đủ để thực hiện đổi.',
            );
          }

          inventory.availableQuantity -= detail.quantity;
          await inventoryRepo.save(inventory);

          const log = inventoryLogRepo.create({
            inventory,
            quantityChange: -detail.quantity,
            action: InventoryLogAction.RETURN,
            note: 'Đổi hàng cho khách',
            employee,
          });
          await inventoryLogRepo.save(log);
        }

        detail.status = ReturnExchangeDetailStatus.APPROVED;
      }

      order.status = ReturnOrderStatus.APPROVED;
      await manager.getRepository(ReturnOrderDetail).save(order.details ?? []);
      await this.recalcTotalRefund(manager, order.id);
      await manager.getRepository(ReturnOrder).save(order);

      return this.findReturnOrderById(manager, order.id, {
        details: { newProduct: true },
        transaction: true,
        customer: true,
        employee: true,
      });
    });
  }
}
