import { CreateOrderDto } from '@/common/dtos';
import { CartStatus } from '@/common/enums';
import { TUserSession } from '@/common/utils';
import { Cart, Invoice, Order, OrderDetail } from '@/database/tenant/entities';
import { TenantService } from '@/tenants/tenant.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import Decimal from 'decimal.js';
import { Repository } from 'typeorm';

@Injectable()
export class OrdersService {
  constructor(private readonly tenantService: TenantService) {}

  async findOrderByField(
    field: keyof Order,
    value: string,
    userSession: TUserSession,
  ) {
    const { bookStoreId } = userSession;

    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const orderRepo = dataSource.getRepository(Order);

    const order = await orderRepo.findOne({
      where: {
        [field]: value,
      },
      relations: {
        details: true,
        invoice: {
          payments: true,
        },
        returnExchangeDetails: true,
      },
    });

    return order ?? null;
  }

  async createOrder(userSession: TUserSession, createOrderDto: CreateOrderDto) {
    const { bookStoreId, userId } = userSession;

    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    return dataSource.transaction(async (manager) => {
      const { cartItemsIds, ...res } = createOrderDto;
      const orderRepo = manager.getRepository(Order);
      const cartRepo = manager.getRepository(Cart);
      const orderDetailRepo = manager.getRepository(OrderDetail);
      const invoiceRepo = manager.getRepository(Invoice);

      const activeCart = await cartRepo.findOne({
        where: {
          employee: {
            userId,
          },
          status: CartStatus.ACTIVE,
        },
        relations: {
          cartItems: {
            book: {
              categories: true,
            },
          },
        },
      });

      if (!activeCart)
        throw new NotFoundException('Active cart not found for this user.');

      const selectedItems = activeCart.cartItems.filter((item) =>
        createOrderDto.cartItemsIds.includes(item.id),
      );

      if (!selectedItems.length)
        throw new BadRequestException('No items selected in cart.');

      const totalAmount = selectedItems
        .reduce((sum, item) => {
          return sum.plus(new Decimal(item.quantity).mul(item.book.price));
        }, new Decimal(0))
        .toNumber();

      const newOrder = orderRepo.create({
        ...res,
        customer: { userId },
        orderCode: await this.generateOrderCode(orderRepo),
        totalAmount,
      });

      await orderRepo.save(newOrder);

      let subTotalSum = new Decimal(0);
      let taxAmountSum = new Decimal(0);

      for (const item of selectedItems) {
        const unitPrice = item.book.price;
        const quantity = item.quantity;
        const subTotal = new Decimal(unitPrice).mul(quantity);

        const taxRate = item.book.categories[0]?.taxRate ?? 0;
        const taxAmount = subTotal.mul(taxRate);

        subTotalSum = subTotalSum.plus(subTotal);
        taxAmountSum = taxAmountSum.plus(taxAmount);

        await this.createOrderDetails(
          {
            order: newOrder,
            book: item.book,
            quantity,
            unitPrice,
          },
          orderDetailRepo,
        );
      }

      const totalWithTax = subTotalSum.plus(taxAmountSum);

      const invoice = invoiceRepo.create({
        order: newOrder,
        taxAmount: taxAmountSum.toNumber(),
        totalWithTax: totalWithTax.toNumber(),
        note: `Invoice of order ${newOrder.orderCode}`,
      });

      await invoiceRepo.save(invoice);

      newOrder.invoice = invoice;
      await orderRepo.save(newOrder);

      return {
        message: 'Order created successfully.',
        data: await this.findOrderByField('id', newOrder.id, userSession),
      };
    });
  }

  private async createOrderDetails(
    data: Partial<OrderDetail>,
    repo: Repository<OrderDetail>,
  ) {
    const newOrderDetail = repo.create(data);
    await repo.save(newOrderDetail);
  }

  private async generateOrderCode(repo: Repository<Order>): Promise<string> {
    let orderCode: string = '';
    let exists = true;

    while (exists) {
      const timestamp = Date.now();
      const randomStr = Math.floor(1000 + Math.random() * 9000);
      orderCode = `ORD${timestamp}${randomStr}`;
      exists = (await repo.findOne({ where: { orderCode } })) ? true : false;
    }

    return orderCode;
  }
}
