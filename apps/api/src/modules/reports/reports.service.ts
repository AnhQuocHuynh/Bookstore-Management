import {
  GetChartFinancialMetricsQueryDto,
  GetOverviewQueryDto,
} from '@/common/dtos';
import { ProductType } from '@/common/enums';
import { calculateGrowth, ItemsSold } from '@/common/utils';
import { Transaction } from '@/database/tenant/entities';
import { TenantService } from '@/tenants/tenant.service';
import { Injectable } from '@nestjs/common';
import { format, getISOWeek } from 'date-fns';

@Injectable()
export class ReportsService {
  constructor(private readonly tenantService: TenantService) {}

  async getOverview(
    bookStoreId: string,
    getOverviewQueryDto: GetOverviewQueryDto,
  ) {
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const { from, to, productType } = getOverviewQueryDto;

    let startDate: Date;
    let endDate: Date = new Date();

    if (from && to) {
      startDate = new Date(from);
      endDate = new Date(to);
    } else {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const transactionRepo = dataSource.getRepository(Transaction);

    const transactions = await transactionRepo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.details', 'td')
      .leftJoinAndSelect('td.product', 'p')
      .where('t.isCompleted = :completed', { completed: true })
      .andWhere('t.createdAt BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .getMany();

    const prevStartDate = new Date(startDate);
    prevStartDate.setMonth(prevStartDate.getMonth() - 1);

    const prevEndDate = new Date(endDate);
    prevEndDate.setMonth(prevEndDate.getMonth() - 1);

    const prevTransactions = await transactionRepo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.details', 'td')
      .leftJoinAndSelect('td.product', 'p')
      .where('t.isCompleted = :completed', { completed: true })
      .andWhere('t.createdAt BETWEEN :start AND :end', {
        start: prevStartDate,
        end: prevEndDate,
      })
      .getMany();

    const revenue = transactions.reduce((sum, t) => sum + t.finalAmount, 0);
    const invoices = transactions.length;

    const revenuePrev = prevTransactions.reduce(
      (sum, t) => sum + t.finalAmount,
      0,
    );
    const invoicesPrev = prevTransactions.length;

    const itemsSold: ItemsSold = transactions.reduce<ItemsSold>(
      (acc, t) => {
        t.details.forEach((td) => {
          if (productType && td.product.type !== productType) return;

          acc.total += td.quantity;

          switch (td.product.type) {
            case ProductType.BOOK:
              acc.breakdown[ProductType.BOOK] += td.quantity;
              break;
            case ProductType.STATIONERY:
              acc.breakdown[ProductType.STATIONERY] += td.quantity;
              break;
            default:
              acc.breakdown[ProductType.OTHER] += td.quantity;
          }
        });
        return acc;
      },
      {
        total: 0,
        breakdown: {
          [ProductType.BOOK]: 0,
          [ProductType.STATIONERY]: 0,
          [ProductType.OTHER]: 0,
        },
      },
    );

    const totalCost = transactions.reduce((sum, t) => {
      return (
        sum + t.details.reduce((detailSum, td) => detailSum + td.totalPrice, 0)
      );
    }, 0);

    const totalCostPrev = prevTransactions.reduce((sum, t) => {
      return (
        sum + t.details.reduce((detailSum, td) => detailSum + td.totalPrice, 0)
      );
    }, 0);

    const breakdownExpenses = {
      purchase_cost: totalCost,
      service_fee: 0,
    };

    const profit = revenue - totalCost;
    const profitPrev = revenuePrev - totalCostPrev;

    const revenueGrowth = calculateGrowth(revenue, revenuePrev);
    const profitGrowth = calculateGrowth(profit, profitPrev);
    const invoicesGrowth = calculateGrowth(invoices, invoicesPrev);

    return {
      timestamp: new Date(),
      overview: {
        profit: {
          value: profit,
          currency: 'VND',
          growth_percent: profitGrowth,
          note: 'Lợi nhuận = Doanh thu - Giá vốn',
        },
        revenue: {
          value: revenue,
          currency: 'VND',
          growth_percent: revenueGrowth,
        },
        transactions: {
          count: invoices,
          growth_percent: invoicesGrowth,
        },
        items_sold: itemsSold,
        expenses: {
          total: totalCost,
          currency: 'VND',
          breakdown: breakdownExpenses,
        },
      },
    };
  }

  async getChartFinancialMetrics(
    bookStoreId: string,
    getChartFinancialMetricsQueryDto: GetChartFinancialMetricsQueryDto,
  ) {
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const { from, to, period = 'day' } = getChartFinancialMetricsQueryDto;
    const transactionRepo = dataSource.getRepository(Transaction);

    const startDate = from
      ? new Date(from)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endDate = to ? new Date(to) : new Date();

    const transactions = await transactionRepo
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.details', 'details')
      .leftJoinAndSelect('details.product', 'product')
      .where('transaction.isCompleted = :completed', { completed: true })
      .andWhere('transaction.createdAt BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .getMany();

    const groupMap: Record<string, { revenue: number; profit: number }> = {};

    transactions.forEach((tx) => {
      let label: string;

      switch (period) {
        case 'week':
          label = `Tuần ${getISOWeek(tx.createdAt)}-${tx.createdAt.getFullYear()}`;
          break;
        case 'month':
          label = `${tx.createdAt.getMonth() + 1}-${tx.createdAt.getFullYear()}`;
          break;
        case 'day':
        default:
          label = format(tx.createdAt, 'yyyy-MM-dd');
      }

      if (!groupMap[label]) {
        groupMap[label] = { revenue: 0, profit: 0 };
      }

      const revenue = tx.finalAmount || 0;
      const cost = tx.details.reduce((sum, d) => sum + (d.totalPrice || 0), 0);
      const profit = revenue - cost;

      groupMap[label].revenue += revenue;
      groupMap[label].profit += profit;
    });

    const labels = Object.keys(groupMap).sort();
    const revenueValues = labels.map((l) => groupMap[l].revenue);
    const profitValues = labels.map((l) => groupMap[l].profit);

    return {
      labels,
      datasets: [
        {
          name: 'Doanh thu',
          values: revenueValues,
        },
        {
          name: 'Lợi nhuận',
          values: profitValues,
        },
      ],
    };
  }

  async getProductChart(
    bookStoreId: string,
    query: GetChartFinancialMetricsQueryDto,
  ) {
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const { from, to, period = 'day' } = query;
    const transactionRepo = dataSource.getRepository(Transaction);

    const startDate = from
      ? new Date(from)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endDate = to ? new Date(to) : new Date();

    const transactions = await transactionRepo
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.details', 'details')
      .leftJoinAndSelect('details.product', 'product')
      .where('transaction.isCompleted = :completed', { completed: true })
      .andWhere('transaction.createdAt BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .getMany();

    const groupMap: Record<
      string,
      { total: number; books: number; stationery: number; others: number }
    > = {};

    transactions.forEach((tx) => {
      let label: string;
      switch (period) {
        case 'week':
          label = `Tuần ${getISOWeek(tx.createdAt)}-${tx.createdAt.getFullYear()}`;
          break;
        case 'month':
          label = `${tx.createdAt.getMonth() + 1}-${tx.createdAt.getFullYear()}`;
          break;
        case 'day':
        default:
          label = format(tx.createdAt, 'yyyy-MM-dd');
      }

      if (!groupMap[label]) {
        groupMap[label] = { total: 0, books: 0, stationery: 0, others: 0 };
      }

      tx.details.forEach((d) => {
        const qty = d.quantity || 0;
        groupMap[label].total += qty;

        switch (d.product.type) {
          case ProductType.BOOK:
            groupMap[label].books += qty;
            break;
          case ProductType.STATIONERY:
            groupMap[label].stationery += qty;
            break;
          default:
            groupMap[label].others += qty;
        }
      });
    });

    const labels = Object.keys(groupMap).sort();
    const totalValues = labels.map((l) => groupMap[l].total);
    const booksValues = labels.map((l) => groupMap[l].books);
    const stationeryValues = labels.map((l) => groupMap[l].stationery);
    const othersValues = labels.map((l) => groupMap[l].others);

    return {
      labels,
      datasets: [
        { name: 'Tổng sản phẩm', values: totalValues },
        { name: 'Sách', values: booksValues },
        { name: 'Văn phòng phẩm', values: stationeryValues },
        { name: 'Sản phẩm khác', values: othersValues },
      ],
    };
  }
}
