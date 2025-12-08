import { CreatePurchaseOrderDto } from '@/common/dtos/purchase-orders';
import { TUserSession } from '@/common/utils';
import {
  Product,
  PurchaseOrder,
  PurchaseOrderDetail,
  Supplier,
} from '@/database/tenant/entities';
import { TenantService } from '@/tenants/tenant.service';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import Decimal from 'decimal.js';
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
}
