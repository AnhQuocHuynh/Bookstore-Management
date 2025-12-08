import {
  CreatePurchaseOrderDto,
  GetPurchaseOrdersQueryDto,
  UpdatePurchaseOrderDto,
} from '@/common/dtos/purchase-orders';
import { PurchaseStatus } from '@/common/enums';
import { TUserSession } from '@/common/utils';
import {
  Product,
  PurchaseOrder,
  PurchaseOrderDetail,
  Supplier,
} from '@/database/tenant/entities';
import { UserRole } from '@/modules/users/enums';
import { TenantService } from '@/tenants/tenant.service';
import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import Decimal from 'decimal.js';
import { omit, update } from 'lodash';
import { FindOptionsRelations, Repository } from 'typeorm';

@Injectable()
export class PurchaseOrdersService {
  constructor(private readonly tenantService: TenantService) {}

  async findPurchaseOrderByField(
    repo: Repository<PurchaseOrder>,
    field: keyof PurchaseOrder,
    value: string,
    relations?: FindOptionsRelations<PurchaseOrder> | undefined,
  ) {
    const purchaseOrder = await repo.findOne({
      where: {
        [field]: value,
      },
      ...(relations && { relations }),
    });

    return purchaseOrder ?? null;
  }

  async createPurchaseOrder(
    createPurchaseOrderDto: CreatePurchaseOrderDto,
    userSession: TUserSession,
  ) {
    const { bookStoreId, userId } = userSession;

    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    return dataSource.transaction(async (manager) => {
      const { supplierId, createPurchaseOrderDetailDtos, note } =
        createPurchaseOrderDto;
      const purchaseOrderRepo = manager.getRepository(PurchaseOrder);
      const purchaseOrderDetailRepo =
        manager.getRepository(PurchaseOrderDetail);
      const supplierRepo = manager.getRepository(Supplier);
      const productRepo = manager.getRepository(Product);

      const findSupplier = await supplierRepo.findOne({
        where: {
          id: supplierId,
        },
      });

      if (!findSupplier) {
        throw new NotFoundException('Không tìm thấy thông tin nhà cung cấp.');
      }

      let newPurchaseOrder = purchaseOrderRepo.create({
        supplier: findSupplier,
        employee: {
          id: userId,
        },
        ...(note?.trim() && { note }),
        totalAmount: 0,
      });

      await purchaseOrderRepo.save(newPurchaseOrder);

      for (const createPurchaseOrderDetailDto of createPurchaseOrderDetailDtos) {
        const { productId, quantity, unitPrice } = createPurchaseOrderDetailDto;

        const findProduct = await productRepo.findOne({
          where: {
            id: productId,
          },
        });

        if (!findProduct) {
          throw new NotFoundException('Không tìm thấy thông tin của sản phẩm.');
        }

        const subTotal = new Decimal(unitPrice).mul(quantity).toFixed(2);

        newPurchaseOrder.totalAmount = new Decimal(newPurchaseOrder.totalAmount)
          .add(subTotal)
          .toNumber();

        const newPurchaseOrderDetail = purchaseOrderDetailRepo.create({
          purchaseOrder: newPurchaseOrder,
          subTotal: new Decimal(subTotal).toNumber(),
          product: findProduct,
          quantity,
          unitPrice,
        });

        await purchaseOrderDetailRepo.save(newPurchaseOrderDetail);
      }

      await purchaseOrderRepo.save(newPurchaseOrder);

      const updatedPurchaseOrder = await this.findPurchaseOrderByField(
        purchaseOrderRepo,
        'id',
        newPurchaseOrder.id,
        {
          details: true,
        },
      );

      if (!updatedPurchaseOrder)
        throw new InternalServerErrorException(
          'Đã xảy ra lỗi khi tạo mới đơn mua.',
        );

      return updatedPurchaseOrder;
    });
  }

  async getPurchaseOrders(
    getPurchaseOrdersQueryDto: GetPurchaseOrdersQueryDto,
    bookStoreId: string,
  ) {
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const purchaseOrderRepo = dataSource.getRepository(PurchaseOrder);
    const { employeeId, employeeName, status } = getPurchaseOrdersQueryDto;

    const qb = purchaseOrderRepo
      .createQueryBuilder('po')
      .leftJoinAndSelect('po.employee', 'employee');

    if (employeeId?.trim()) {
      qb.andWhere('employee.id = :employeeId', {
        employeeId,
      });
    }

    if (employeeName?.trim()) {
      qb.andWhere('employee.fullName ILIKE :employeeName', {
        employeeName: `%${employeeName}%`,
      });
    }

    if (status?.trim()) {
      qb.andWhere('po.status = :status', {
        status,
      });
    }

    const result = await qb.getMany();

    return result.map((r) => omit(r, ['employee.password']));
  }

  async getPurchaseOrderDetail(id: string, bookStoreId: string) {
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const purchaseOrderRepo = dataSource.getRepository(PurchaseOrder);

    const purchaseOrder = await this.findPurchaseOrderByField(
      purchaseOrderRepo,
      'id',
      id,
      {
        employee: true,
        supplier: true,
        details: true,
      },
    );

    if (!purchaseOrder) {
      throw new NotFoundException('Không tìm thấy thông tin đơn mua.');
    }

    return omit(purchaseOrder, ['employee.password']);
  }

  async updatePurchaseOrder(
    id: string,
    updatePurchaseOrderDto: UpdatePurchaseOrderDto,
    userSession: TUserSession,
  ) {
    const { status, note, supplierId, updatePurchaseOrderDetailDtos } =
      updatePurchaseOrderDto;
    const { bookStoreId, role } = userSession;

    if (!bookStoreId?.trim()) {
      throw new NotFoundException('Không tìm thấy mã nhà sách của bạn.');
    }

    if (role === UserRole.EMPLOYEE && status?.trim()) {
      if (
        status === PurchaseStatus.APPROVED ||
        status === PurchaseStatus.CANCELLED
      ) {
        throw new ForbiddenException(
          'Bạn không có quyền cập nhật trạng thái này cho đơn mua.',
        );
      }
    }

    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    return dataSource.transaction(async (manager) => {
      const purchaseOrderRepo = manager.getRepository(PurchaseOrder);
      const supplierRepo = manager.getRepository(Supplier);

      const findPurchase = await this.findPurchaseOrderByField(
        purchaseOrderRepo,
        'id',
        id,
      );

      if (!findPurchase)
        throw new NotFoundException('Không tìm thấy thông tin đơn mua.');

      if (
        findPurchase.status !== PurchaseStatus.DRAFT &&
        findPurchase.status !== PurchaseStatus.PENDING_APPROVAL
      ) {
        throw new ForbiddenException(
          'Đơn mua không ở trạng thái cho phép chỉnh sửa.',
        );
      }

      if (supplierId?.trim()) {
        const findSupplier = await supplierRepo.findOne({
          where: {
            id: supplierId,
          },
        });

        if (!findSupplier) {
          throw new NotFoundException('Không tìm thấy thông tin nhà cung cấp.');
        }

        findPurchase.supplier = findSupplier;
      }

      findPurchase.note = note || findPurchase.note;
      findPurchase.status = status || findPurchase.status;

      if (status === PurchaseStatus.SENT_TO_SUPPLIER) {
        findPurchase.purchaseDate = new Date();
      }

      await purchaseOrderRepo.save(findPurchase);

      const updated = await this.findPurchaseOrderByField(
        purchaseOrderRepo,
        'id',
        id,
        {
          employee: true,
          details: true,
          supplier: true,
        },
      );

      if (!updated) {
        throw new InternalServerErrorException(
          'Đã xảy ra lỗi khi cập nhật đơn mua.',
        );
      }

      return omit(updated, ['employee.password']);
    });
  }
}
