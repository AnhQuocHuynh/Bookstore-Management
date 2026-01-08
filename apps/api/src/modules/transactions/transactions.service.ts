import {
  AddDetailToTransactionDto,
  CreateTransactionDetailDto,
  CreateTransactionDto,
  GetTransactionsQueryDto,
  UpdateTransactionDetailDto,
  UpdateTransactionDto,
} from '@/common/dtos';
import { ReturnDetailsDto } from '@/common/dtos/transactions/return-details.dto';
import { TUserSession } from '@/common/utils';
import {
  Employee,
  Inventory,
  Product,
  Transaction,
  TransactionDetail,
} from '@/database/tenant/entities';
import { InventoriesService } from '@/modules/inventories/inventories.service';
import { TenantService } from '@/tenants/tenant.service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import Decimal from 'decimal.js';
import { omit } from 'lodash';
import { Repository } from 'typeorm';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly tenantService: TenantService,
    private readonly inventoriesService: InventoriesService,
  ) {}

  async createTransaction(
    createTransactionDto: CreateTransactionDto,
    userSession: TUserSession,
  ) {
    const { userId, bookStoreId } = userSession;
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    return dataSource.transaction(async (manager) => {
      const transactionRepo = manager.getRepository(Transaction);
      const transactionDetailRepo = manager.getRepository(TransactionDetail);
      const productRepo = manager.getRepository(Product);
      const employeeRepo = manager.getRepository(Employee);
      const inventoryRepo = manager.getRepository(Inventory);
      const {
        createTransactionDetailDtos,
        note,
        paidAmount,
        changeAmount,
        finalAmount,
        taxAmount,
        totalAmount,
        paymentMethod,
      } = createTransactionDto;

      const employee = await employeeRepo.findOne({
        where: {
          id: userId,
        },
      });

      if (!employee) {
        throw new NotFoundException('Không tìm thấy thông tin của bạn.');
      }

      const newTransaction = transactionRepo.create({
        cashier: employee,
        ...(note?.trim() && { note }),
        totalAmount,
        taxAmount,
        finalAmount,
        details: [],
        paidAmount,
        changeAmount: changeAmount ?? 0,
        paymentMethod,
        completedAt: new Date(),
        isCompleted: true,
      });

      await transactionRepo.save(newTransaction);

      for (const dto of createTransactionDetailDtos) {
        await this.createNewTransactionDetail(
          dto,
          productRepo,
          newTransaction,
          transactionDetailRepo,
          inventoryRepo,
        );
      }

      const savedTransaction = await transactionRepo.findOne({
        where: {
          id: newTransaction.id,
        },
        relations: {
          details: true,
        },
      });

      if (!savedTransaction) {
        throw new InternalServerErrorException(
          'Đã xảy ra lỗi trong quá trình tạo hoá đơn mua hàng.',
        );
      }

      return transactionRepo.save(savedTransaction);
    });
  }

  async updateTransaction(
    transactionId: string,
    userSession: TUserSession,
    updateTransactionDto: UpdateTransactionDto,
  ) {
    const { bookStoreId, userId } = userSession;
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    return dataSource.transaction(async (manager) => {
      const transactionRepo = manager.getRepository(Transaction);
      const { paymentMethod } = updateTransactionDto;

      const transaction = await transactionRepo.findOne({
        where: {
          id: transactionId,
        },
        relations: {
          details: true,
          cashier: true,
        },
      });

      if (!transaction) {
        throw new NotFoundException('Không tìm thấy thông tin đơn mua hàng.');
      }

      if (transaction.cashier.id !== userId) {
        throw new NotFoundException('Hoá đơn này không phải do bạn lập.');
      }

      transaction.paymentMethod = paymentMethod || transaction.paymentMethod;

      if (paymentMethod) {
        transaction.isCompleted = true;
        transaction.completedAt = new Date();
      }

      return transactionRepo.save(transaction);
    });
  }

  async updateTransactionDetail(
    transactionId: string,
    transactionDetailId: string,
    userSession: TUserSession,
    updateTransactionDetailDto: UpdateTransactionDetailDto,
  ) {
    const { bookStoreId, userId } = userSession;
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    return dataSource.transaction(async (manager) => {
      const transactionRepo = manager.getRepository(Transaction);
      const transactionDetailRepo = manager.getRepository(TransactionDetail);

      let transaction = await transactionRepo.findOne({
        where: {
          id: transactionId,
        },
        relations: {
          details: true,
          cashier: true,
        },
      });

      if (!transaction) {
        throw new NotFoundException(
          'Không tìm thấy thông tin về hoá đơn mua hàng.',
        );
      }

      if (transaction.cashier.id !== userId) {
        throw new ForbiddenException('Hoá đơn này không phải do bạn lập.');
      }

      const transactionDetail = await transactionDetailRepo.findOne({
        where: {
          id: transactionDetailId,
        },
        relations: {
          product: {
            inventory: true,
          },
        },
      });

      if (!transactionDetail) {
        throw new NotFoundException(
          'Không tìm thấy thông tin chi tiết trong đơn mua hàng.',
        );
      }

      if (!transaction.details.find((d) => d.id === transactionDetailId)) {
        throw new ForbiddenException(
          'Chi tiết trong đơn mua hàng không thuộc về đơn hàng.',
        );
      }

      const { quantity } = updateTransactionDetailDto;

      if (
        quantity &&
        transactionDetail.product.inventory.availableQuantity < quantity
      ) {
        throw new BadRequestException(
          `Sản phẩm "${transactionDetail.product.name}" chỉ còn ${transactionDetail.product.inventory.availableQuantity} trong kho, không đủ để xuất ${quantity} cái.`,
        );
      }

      if (quantity && quantity > transactionDetail.quantity) {
        throw new BadRequestException(
          'Bạn đang thêm chi tiết vào đơn hàng. Vui lòng gọi API thêm chi tiết vào đơn hàng.',
        );
      }

      const updatableFields: (keyof typeof updateTransactionDetailDto)[] = [
        'unitPrice',
        'quantity',
      ];

      if (updatableFields.length > 0) {
        updatableFields.forEach((field) => {
          const value = updateTransactionDetailDto[field];
          if (value !== undefined) {
            transactionDetail[field] = value;
          }
        });

        this.recalcTransactionDetail(transactionDetail);

        await transactionDetailRepo.save(transactionDetail);

        transaction = await transactionRepo.findOne({
          where: {
            id: transactionId,
          },
          relations: {
            details: {
              product: {
                inventory: true,
                book: true,
              },
            },
            cashier: true,
          },
        });

        if (!transaction) {
          throw new InternalServerErrorException(
            'Đã xảy ra lỗi khi cập nhật chi tiết trong đơn mua hàng.',
          );
        }

        this.recalcTransaction(transaction);

        return omit(await transactionRepo.save(transaction), [
          'cashier.password',
        ]);
      }

      return transaction;
    });
  }

  private recalcTransaction(transaction: Transaction) {
    const totalAmount = transaction.details.reduce(
      (sum, detail) =>
        sum.plus(new Decimal(detail.unitPrice).times(detail.quantity)),
      new Decimal(0),
    );

    const taxAmount = totalAmount.times(0.1);

    const finalAmount = totalAmount.plus(taxAmount);

    transaction.totalAmount = Number(totalAmount.toFixed(2));
    transaction.taxAmount = Number(taxAmount.toFixed(2));
    transaction.finalAmount = Number(finalAmount.toFixed(2));

    return transaction;
  }

  private recalcTransactionDetail(detail: TransactionDetail) {
    const totalPrice = new Decimal(detail.unitPrice).times(detail.quantity);

    detail.totalPrice = Number(totalPrice.toFixed(2));
    return detail;
  }

  async addDetailToTransaction(
    transactionId: string,
    userSession: TUserSession,
    addDetailToTransactionDto: AddDetailToTransactionDto,
  ) {
    const { bookStoreId, userId } = userSession;
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    return dataSource.transaction(async (manager) => {
      const transactionRepo = manager.getRepository(Transaction);
      const productRepo = manager.getRepository(Product);
      const transactionDetailRepo = manager.getRepository(TransactionDetail);
      const inventoryRepo = manager.getRepository(Inventory);

      const transaction = await transactionRepo.findOne({
        where: {
          id: transactionId,
        },
        relations: {
          cashier: true,
          details: true,
        },
      });

      if (!transaction) {
        throw new NotFoundException(
          'Không tìm thấy thông tin về hoá đơn mua hàng.',
        );
      }

      if (transaction.cashier.id !== userId) {
        throw new ForbiddenException(
          'Đơn mua này không phải do bạn tạo nên không thể thêm chi tiết.',
        );
      }

      for (const dto of addDetailToTransactionDto.createTransactionDetailDtos) {
        await this.createNewTransactionDetail(
          dto,
          productRepo,
          transaction,
          transactionDetailRepo,
          inventoryRepo,
        );
      }

      const updatedTransaction = await transactionRepo.findOne({
        where: {
          id: transactionId,
        },
        relations: {
          details: {
            product: {
              inventory: true,
              book: true,
            },
          },
          cashier: true,
        },
      });

      if (!updatedTransaction) {
        throw new InternalServerErrorException(
          'Đã xảy ra lỗi khi thêm chi tiết đơn mua vào đơn mua.',
        );
      }

      this.recalcTransaction(updatedTransaction);

      return omit(await transactionRepo.save(updatedTransaction), [
        'cashier.password',
      ]);
    });
  }

  private async createNewTransactionDetail(
    dto: CreateTransactionDetailDto,
    productRepo: Repository<Product>,
    transaction: Transaction,
    transactionDetailRepo: Repository<TransactionDetail>,
    inventoryRepo: Repository<Inventory>,
  ) {
    const { productId, quantity, unitPrice } = dto;

    const product = await productRepo.findOne({
      where: { id: productId },
      relations: { inventory: true },
    });

    if (!product) {
      throw new NotFoundException('Không tìm thấy thông tin sản phẩm');
    }

    const existingDetail = await transactionDetailRepo.findOne({
      where: {
        transaction: { id: transaction.id },
        product: { id: productId },
      },
    });

    const incomingQty = new Decimal(quantity);

    if (existingDetail) {
      const newQty = new Decimal(existingDetail.quantity).plus(incomingQty);

      if (product.inventory.availableQuantity < newQty.toNumber()) {
        throw new BadRequestException(
          `Sản phẩm "${product.name}" chỉ còn ${product.inventory.availableQuantity} trong kho, không đủ để xuất ${newQty.toNumber()} cái.`,
        );
      }

      const price = new Decimal(unitPrice ?? existingDetail.unitPrice);

      existingDetail.quantity = newQty.toNumber();
      existingDetail.unitPrice = price.toNumber();
      existingDetail.totalPrice = Number(price.times(newQty).toFixed(2));

      await this.inventoriesService.updateStockOfProductInventory(
        productId,
        quantity,
        inventoryRepo,
        'decrease',
      );

      return transactionDetailRepo.save(existingDetail);
    }

    if (product.inventory.availableQuantity < quantity) {
      throw new BadRequestException(
        `Sản phẩm "${product.name}" chỉ còn ${product.inventory.availableQuantity} trong kho, không đủ để xuất ${quantity} cái.`,
      );
    }

    const price = new Decimal(unitPrice ?? product.price);
    const qty = new Decimal(quantity);

    const newTransactionDetail = transactionDetailRepo.create({
      transaction,
      product,
      quantity,
      unitPrice: price.toNumber(),
      totalPrice: Number(price.times(qty).toFixed(2)),
    });

    return transactionDetailRepo.save(newTransactionDetail);
  }

  async getTransactions(
    getTransactionsQueryDto: GetTransactionsQueryDto,
    bookStoreId: string,
  ) {
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const transactionRepo = dataSource.getRepository(Transaction);

    const {
      cashierId,
      cashierName,
      paymentMethod,
      isCompleted,
      minTotalAmount,
      maxTotalAmount,
      minFinalAmount,
      maxFinalAmount,
      from,
      to,
    } = getTransactionsQueryDto;

    let qb = transactionRepo
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.cashier', 'cashier')
      .leftJoinAndSelect('transaction.details', 'details')
      .leftJoinAndSelect('details.product', 'product')
      .leftJoinAndSelect('transaction.returnOrders', 'returnOrders');

    if (cashierId) {
      qb = qb.andWhere('cashier.id = :cashierId', { cashierId });
    }

    if (cashierName) {
      qb = qb.andWhere('cashier.name ILIKE :cashierName', {
        cashierName: `%${cashierName}%`,
      });
    }

    if (paymentMethod) {
      qb = qb.andWhere('transaction.paymentMethod = :paymentMethod', {
        paymentMethod,
      });
    }

    if (typeof isCompleted === 'boolean') {
      qb = qb.andWhere('transaction.isCompleted = :isCompleted', {
        isCompleted,
      });
    }

    if (minTotalAmount !== undefined) {
      qb = qb.andWhere('transaction.totalAmount >= :minTotalAmount', {
        minTotalAmount: new Decimal(minTotalAmount).toFixed(2),
      });
    }

    if (maxTotalAmount !== undefined) {
      qb = qb.andWhere('transaction.totalAmount <= :maxTotalAmount', {
        maxTotalAmount: new Decimal(maxTotalAmount).toFixed(2),
      });
    }

    if (minFinalAmount !== undefined) {
      qb = qb.andWhere('transaction.finalAmount >= :minFinalAmount', {
        minFinalAmount: new Decimal(minFinalAmount).toFixed(2),
      });
    }

    if (maxFinalAmount !== undefined) {
      qb = qb.andWhere('transaction.finalAmount <= :maxFinalAmount', {
        maxFinalAmount: new Decimal(maxFinalAmount).toFixed(2),
      });
    }

    if (from) {
      qb = qb.andWhere('transaction.createdAt >= :from', { from });
    }

    if (to) {
      qb = qb.andWhere('transaction.createdAt <= :to', { to });
    }

    qb = qb.orderBy('transaction.createdAt', 'DESC');

    const transactions = await qb.getMany();

    return transactions.map((t) => ({
      ...t,
      cashier: omit(t.cashier, ['password']),
      details: t.details.map((detail) => ({
        ...detail,
        productName: detail.product?.name, // <--- Lấy tên sản phẩm ra ngoài
        // product: detail.product // Bỏ comment dòng này nếu bạn muốn giữ cả cục object product
      })),
    }));
  }

  async getTransaction(id: string, bookStoreId: string) {
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const transactionRepo = dataSource.getRepository(Transaction);

    const transaction = await transactionRepo.findOne({
      where: {
        id,
      },
      relations: {
        cashier: true,
        returnOrders: true,
        details: {
          product: {
            inventory: true,
            book: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Không tìm thấy thông tin hoá đơn.');
    }

    return omit(transaction, ['cashier.password']);
  }

  async returnDetails(returnDetailsDto: ReturnDetailsDto, bookStoreId: string) {
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const productRepo = dataSource.getRepository(Product);

    const { createTransactionDetailDtos } = returnDetailsDto;

    let totalAmount = new Decimal(0);
    let totalTaxAmount = new Decimal(0);

    for (const dto of createTransactionDetailDtos) {
      const { productId, unitPrice, quantity } = dto;

      const product = await productRepo.findOne({
        where: { id: productId },
        relations: {
          categories: true,
        },
      });

      if (!product) {
        throw new NotFoundException('Không tìm thấy thông tin sản phẩm');
      }

      const price = new Decimal(unitPrice ?? product.price);
      const qty = new Decimal(quantity);
      const lineTotal = price.times(qty);
      totalAmount = totalAmount.plus(lineTotal);

      let lineTax: Decimal;

      if (product.taxRate != null) {
        lineTax = lineTotal.times(new Decimal(product.taxRate));
      } else if (product.categories.length > 0) {
        const categoryRates = product.categories.map(
          (c) => new Decimal(c.taxRate ?? 0),
        );
        const sumRate = categoryRates.reduce(
          (a, b) => a.plus(b),
          new Decimal(0),
        );
        const avgRate = sumRate.dividedBy(categoryRates.length);
        lineTax = lineTotal.times(avgRate);
      } else {
        lineTax = new Decimal(0);
      }

      totalTaxAmount = totalTaxAmount.plus(lineTax);
    }

    const finalAmount = totalAmount.plus(totalTaxAmount);

    return {
      totalAmount: totalAmount.toNumber(),
      taxAmount: totalTaxAmount.toNumber(),
      finalAmount: finalAmount.toNumber(),
    };
  }
}
