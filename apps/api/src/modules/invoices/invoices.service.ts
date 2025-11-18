import { CreateInvoiceDto } from '@/common/dtos';
import { TUserSession } from '@/common/utils';
import { Invoice, Order } from '@/database/tenant/entities';
import { TenantService } from '@/tenants/tenant.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class InvoicesService {
  constructor(private readonly tenantService: TenantService) {}

  async createInvoice(
    createInvoiceDto: CreateInvoiceDto,
    userSession: TUserSession,
  ) {
    const { bookStoreId } = userSession;

    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const { orderId, ...res } = createInvoiceDto;

    const orderRepo = dataSource.getRepository(Order);
    const invoiceRepo = dataSource.getRepository(Invoice);

    const order = await orderRepo.findOne({
      where: {
        id: orderId,
      },
    });

    if (!order) throw new NotFoundException(`Order ${orderId} not found.`);

    const newInvoice = invoiceRepo.create({
      ...res,
      order,
      invoiceCode: await this.generateOrderCode(invoiceRepo),
    });
    return invoiceRepo.save(newInvoice);
  }

  private async generateOrderCode(repo: Repository<Invoice>): Promise<string> {
    let invoiceCode: string = '';
    let exists = true;

    while (exists) {
      const timestamp = Date.now();
      const randomStr = Math.floor(1000 + Math.random() * 9000);
      invoiceCode = `INV${timestamp}${randomStr}`;
      exists = (await repo.findOne({ where: { invoiceCode } })) ? true : false;
    }

    return invoiceCode;
  }
}
