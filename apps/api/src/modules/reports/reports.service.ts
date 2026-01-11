import {
  GetChartFinancialMetricsQueryDto,
  GetOverviewQueryDto,
  GetRevenueDashboardQueryDto,
  GetEmployeesDashboardQueryDto,
  GetStockDashboardQueryDto,
  PeriodType,
} from '@/common/dtos';
import { ProductType, PurchaseStatus } from '@/common/enums';
import { calculateGrowth, ItemsSold } from '@/common/utils';
import {
  Transaction,
  TransactionDetail,
  PurchaseOrder,
  PurchaseOrderDetail,
  Product,
  Category,
  Employee,
  Inventory,
  InventoryLog,
} from '@/database/tenant/entities';
import { TenantService } from '@/tenants/tenant.service';
import { Injectable } from '@nestjs/common';
import { format, getISOWeek } from 'date-fns';
import { In } from 'typeorm';

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

  async getRevenueDashboard(
    bookStoreId: string,
    dto: GetRevenueDashboardQueryDto,
  ) {
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const {
      from,
      to,
      period = PeriodType.DAY,
      topN = 6,
      categoryIds,
      search,
    } = dto;

    const startDate = from
      ? new Date(from)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endDate = to ? new Date(to) : new Date();

    const transactionRepo = dataSource.getRepository(Transaction);
    const purchaseOrderRepo = dataSource.getRepository(PurchaseOrder);

    const prevStartDate = new Date(startDate);
    const prevEndDate = new Date(endDate);
    const periodDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    prevStartDate.setDate(prevStartDate.getDate() - periodDays);
    prevEndDate.setDate(prevEndDate.getDate() - periodDays);

    const cardsQuery = transactionRepo
      .createQueryBuilder('t')
      .leftJoin('t.details', 'td')
      .where('t.isCompleted = :completed', { completed: true })
      .andWhere('t.createdAt BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .select('SUM(t.finalAmount)', 'revenue')
      .addSelect('COUNT(DISTINCT t.id)', 'orders')
      .addSelect('SUM(td.quantity)', 'itemsSold')
      .addSelect('SUM(td.totalPrice)', 'totalCost')
      .getRawOne();

    const prevCardsQuery = transactionRepo
      .createQueryBuilder('t')
      .leftJoin('t.details', 'td')
      .where('t.isCompleted = :completed', { completed: true })
      .andWhere('t.createdAt BETWEEN :start AND :end', {
        start: prevStartDate,
        end: prevEndDate,
      })
      .select('SUM(t.finalAmount)', 'revenue')
      .addSelect('COUNT(DISTINCT t.id)', 'orders')
      .addSelect('SUM(td.quantity)', 'itemsSold')
      .addSelect('SUM(td.totalPrice)', 'totalCost')
      .getRawOne();

    const purchaseSpendQuery = purchaseOrderRepo
      .createQueryBuilder('po')
      .where('po.status IN (:...statuses)', {
        statuses: [PurchaseStatus.RECEIVED, PurchaseStatus.COMPLETED],
      })
      .andWhere('po.createdAt BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .select('SUM(po.totalAmount)', 'total')
      .getRawOne();

    const prevPurchaseSpendQuery = purchaseOrderRepo
      .createQueryBuilder('po')
      .where('po.status IN (:...statuses)', {
        statuses: [PurchaseStatus.RECEIVED, PurchaseStatus.COMPLETED],
      })
      .andWhere('po.createdAt BETWEEN :start AND :end', {
        start: prevStartDate,
        end: prevEndDate,
      })
      .select('SUM(po.totalAmount)', 'total')
      .getRawOne();

    const lastTransactionQuery = transactionRepo
      .createQueryBuilder('t')
      .select('MAX(t.updatedAt)', 'lastTransactionAt')
      .getRawOne();

    const lastPurchaseQuery = purchaseOrderRepo
      .createQueryBuilder('po')
      .select('MAX(po.updatedAt)', 'lastPurchaseAt')
      .getRawOne();

    const [
      cardsResult,
      prevCardsResult,
      purchaseSpendResult,
      prevPurchaseSpendResult,
      lastTransactionResult,
      lastPurchaseResult,
    ] = await Promise.all([
      cardsQuery,
      prevCardsQuery,
      purchaseSpendQuery,
      prevPurchaseSpendQuery,
      lastTransactionQuery,
      lastPurchaseQuery,
    ]);

    const revenue = parseFloat(cardsResult?.revenue || '0');
    const orders = parseInt(cardsResult?.orders || '0');
    const itemsSold = parseInt(cardsResult?.itemsSold || '0');
    const totalCost = parseFloat(cardsResult?.totalCost || '0');
    const profit = revenue - totalCost;

    const prevRevenue = parseFloat(prevCardsResult?.revenue || '0');
    const prevOrders = parseInt(prevCardsResult?.orders || '0');
    const prevItemsSold = parseInt(prevCardsResult?.itemsSold || '0');
    const prevTotalCost = parseFloat(prevCardsResult?.totalCost || '0');
    const prevProfit = prevRevenue - prevTotalCost;

    const purchaseSpend = parseFloat(purchaseSpendResult?.total || '0');
    const prevPurchaseSpend = parseFloat(prevPurchaseSpendResult?.total || '0');

    let pieQuery = transactionRepo
      .createQueryBuilder('t')
      .leftJoin('t.details', 'td')
      .leftJoin('td.product', 'p')
      .where('t.isCompleted = :completed', { completed: true })
      .andWhere('t.createdAt BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .andWhere('p.id IS NOT NULL')
      .select('p.id', 'productId')
      .addSelect('p.name', 'name')
      .addSelect('p.sku', 'sku')
      .addSelect('p.imageUrl', 'imageUrl')
      .addSelect('SUM(td.totalPrice)', 'revenue')
      .groupBy('p.id')
      .addGroupBy('p.name')
      .addGroupBy('p.sku')
      .addGroupBy('p.imageUrl')
      .orderBy('revenue', 'DESC')
      .limit(topN);

    if (search) {
      pieQuery = pieQuery.andWhere(
        '(p.name ILIKE :search OR p.sku ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const pieResults = await pieQuery.getRawMany();
    const validPieResults = pieResults.filter((r) => r.productId && r.name);
    
    const pieTotal = validPieResults.reduce(
      (sum, r) => sum + parseFloat(r.revenue || '0'),
      0,
    );

    const pieItems = validPieResults.map((r) => {
      const revenueValue = parseFloat(r.revenue || '0');
      return {
        productId: r.productId,
        name: r.name,
        sku: r.sku,
        imageUrl: r.imageUrl || undefined,
        value: revenueValue,
        percent: pieTotal > 0 ? (revenueValue / pieTotal) * 100 : 0,
      };
    });

    const queryBuilder = transactionRepo
      .createQueryBuilder('t')
      .leftJoin('t.details', 'td')
      .leftJoin('td.product', 'p')
      .leftJoin('p.categories', 'c')
      .select([
        't.id',
        't.totalAmount',
        't.finalAmount',
        't.createdAt',
      ])
      .addSelect([
        'td.id',
        'td.quantity',
        'td.unitPrice',
        'td.totalPrice',
        'td.createdAt',
      ])
      .addSelect([
        'p.id',
        'p.name',
        'p.imageUrl',
        'p.type',
      ])
      .addSelect([
        'c.id',
        'c.name',
      ])
      .where('t.isCompleted = :completed', { completed: true })
      .andWhere('t.createdAt BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .orderBy('t.createdAt', 'ASC');

    const { raw } = await queryBuilder.getRawAndEntities();
    const transactionMap = new Map<string, any>();
    
    raw.forEach((row: any) => {
      const txId = row.t_id;
      if (!transactionMap.has(txId)) {
        transactionMap.set(txId, {
          id: row.t_id,
          createdAt: row.t_created_at,
          totalAmount: parseFloat(row.t_total_amount || '0'),
          finalAmount: parseFloat(row.t_final_amount || '0'),
          details: [],
        });
      }
      
      const tx = transactionMap.get(txId);
      if (row.td_id && !tx.details.find((d: any) => d.id === row.td_id)) {
        tx.details.push({
          id: row.td_id,
          quantity: parseInt(row.td_quantity || '0'),
          unitPrice: parseFloat(row.td_unit_price || '0'),
          totalPrice: parseFloat(row.td_total_price || '0'),
          product: row.p_id
            ? {
                id: row.p_id,
                name: row.p_name,
                imageUrl: row.p_image_url,
                type: row.p_type,
                categories: [],
              }
            : null,
        });
      }

      if (row.p_id && row.c_id) {
        const detail = tx.details.find((d: any) => d.product?.id === row.p_id);
        if (detail?.product && !detail.product.categories.find((c: any) => c.id === row.c_id)) {
          detail.product.categories.push({
            id: row.c_id,
            name: row.c_name,
          });
        }
      }
    });

    const transactionsWithDetails = Array.from(transactionMap.values());
    const lineLabels: string[] = [];
    const lineDatasetsMap: Record<string, Record<string, number>> = {};

    transactionsWithDetails.forEach((tx) => {
      let label: string;
      switch (period) {
        case PeriodType.WEEK:
          label = `Tuần ${getISOWeek(tx.createdAt)}-${tx.createdAt.getFullYear()}`;
          break;
        case PeriodType.MONTH:
          label = `${tx.createdAt.getMonth() + 1}-${tx.createdAt.getFullYear()}`;
          break;
        case PeriodType.DAY:
        default:
          label = format(tx.createdAt, 'yyyy-MM-dd');
          break;
      }

      if (!lineLabels.includes(label)) {
        lineLabels.push(label);
      }

      tx.details.forEach((td) => {
        const categories = (td.product?.categories || []).sort((a, b) =>
          a.id.localeCompare(b.id),
        );
        const category = categories.length > 0 ? categories[0] : null;
        const categoryName = category?.name || 'Khác';
        const categoryId = category?.id || null;

        if (categoryIds && categoryIds.length > 0 && categoryId && !categoryIds.includes(categoryId)) {
          return;
        }

        const detailRevenue = td.product
          ? (tx.finalAmount * (td.totalPrice / (tx.totalAmount || 1)))
          : 0;

        if (!lineDatasetsMap[categoryName]) {
          lineDatasetsMap[categoryName] = {};
        }
        if (!lineDatasetsMap[categoryName][label]) {
          lineDatasetsMap[categoryName][label] = 0;
        }
        lineDatasetsMap[categoryName][label] += detailRevenue;
      });
    });

    lineLabels.sort();
    let lineDatasets = Object.entries(lineDatasetsMap).map(([name, valuesMap]) => ({
      name,
      values: lineLabels.map((label) => valuesMap[label] || 0),
    }));

    if (lineDatasets.length === 0 || lineLabels.length === 0) {
      const fallbackLineQuery = transactionRepo
        .createQueryBuilder('t')
        .leftJoin('t.details', 'td')
        .where('t.isCompleted = :completed', { completed: true })
        .andWhere('t.createdAt BETWEEN :start AND :end', {
          start: startDate,
          end: endDate,
        });

      let dateGroupBy = '';
      switch (period) {
        case PeriodType.WEEK:
          dateGroupBy = `TO_CHAR(t.created_at, 'IYYY-"W"IW')`;
          break;
        case PeriodType.MONTH:
          dateGroupBy = `TO_CHAR(t.created_at, 'YYYY-MM')`;
          break;
        case PeriodType.DAY:
        default:
          dateGroupBy = `TO_CHAR(t.created_at, 'YYYY-MM-DD')`;
          break;
      }

      const fallbackResults = await fallbackLineQuery
        .select(dateGroupBy, 'label')
        .addSelect('SUM(t.finalAmount)', 'revenue')
        .addSelect('SUM(COALESCE(td.totalPrice, 0))', 'cost')
        .groupBy('label')
        .orderBy('label', 'ASC')
        .getRawMany();

      const fallbackLabels = fallbackResults.map((r) => r.label || '').sort();
      lineDatasets = [
        {
          name: 'Doanh thu',
          values: fallbackLabels.map((label) => {
            const result = fallbackResults.find((r) => r.label === label);
            return parseFloat(result?.revenue || '0');
          }),
        },
        {
          name: 'Lợi nhuận',
          values: fallbackLabels.map((label) => {
            const result = fallbackResults.find((r) => r.label === label);
            const revenue = parseFloat(result?.revenue || '0');
            const cost = parseFloat(result?.cost || '0');
            return revenue - cost;
          }),
        },
      ];
      lineLabels.length = 0;
      lineLabels.push(...fallbackLabels);
    }

    const topProducts = pieItems
      .filter((item) => item.productId && item.name)
      .map((item) => ({
        productId: item.productId,
        name: item.name,
        sku: item.sku,
        imageUrl: item.imageUrl,
        revenue: item.value,
        percent: revenue > 0 ? (item.value / revenue) * 100 : 0,
      }));

    const lastDataAt = new Date(
      Math.max(
        new Date(lastTransactionResult?.lastTransactionAt || 0).getTime(),
        new Date(lastPurchaseResult?.lastPurchaseAt || 0).getTime(),
      ),
    );

    return {
      meta: {
        generatedAt: new Date(),
        lastDataAt,
      },
      cards: {
        revenue: {
          value: revenue,
          currency: 'VND',
          growthPercent: calculateGrowth(revenue, prevRevenue),
          growthAbs: revenue - prevRevenue,
        },
        profit: {
          value: profit,
          currency: 'VND',
          growthPercent: calculateGrowth(profit, prevProfit),
          growthAbs: profit - prevProfit,
        },
        orders: {
          count: orders,
          growthPercent: calculateGrowth(orders, prevOrders),
          growthAbs: orders - prevOrders,
        },
        itemsSold: {
          total: itemsSold,
          growthPercent: calculateGrowth(itemsSold, prevItemsSold),
          growthAbs: itemsSold - prevItemsSold,
        },
        purchaseSpend: {
          total: purchaseSpend,
          currency: 'VND',
          growthPercent: calculateGrowth(purchaseSpend, prevPurchaseSpend),
          growthAbs: purchaseSpend - prevPurchaseSpend,
        },
        serviceFee: {
          total: 0,
          currency: 'VND',
        },
      },
      pie: {
        total: pieTotal,
        items: pieItems,
      },
      line: {
        labels: lineLabels,
        datasets: lineDatasets,
      },
      top: topProducts,
    };
  }

  async getEmployeesDashboard(
    bookStoreId: string,
    dto: GetEmployeesDashboardQueryDto,
  ) {
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const { from, to, page = 1, limit = 20 } = dto;

    const startDate = from
      ? new Date(from)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endDate = to ? new Date(to) : new Date();

    const transactionRepo = dataSource.getRepository(Transaction);

    const employeeStatsQuery = transactionRepo
      .createQueryBuilder('t')
      .leftJoin('t.cashier', 'e')
      .where('t.isCompleted = :completed', { completed: true })
      .andWhere('t.createdAt BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .andWhere('e.id IS NOT NULL')
      .select('e.id', 'employeeId')
      .addSelect('e.fullName', 'employeeName')
      .addSelect('e.avatarUrl', 'avatarUrl')
      .addSelect('COUNT(t.id)', 'transactionCount')
      .groupBy('e.id')
      .addGroupBy('e.fullName')
      .addGroupBy('e.avatarUrl')
      .orderBy('COUNT(t.id)', 'DESC');

    const employeeStats = await employeeStatsQuery.getRawMany();

    const totalTransactions = employeeStats.reduce(
      (sum, stat) => sum + parseInt(stat.transactionCount || '0'),
      0,
    );

    const pieItems = employeeStats.map((stat) => {
      const count = parseInt(stat.transactionCount || '0');
      return {
        employeeId: stat.employeeId,
        employeeName: stat.employeeName,
        avatarUrl: stat.avatarUrl || undefined,
        value: count,
        percent: totalTransactions > 0 ? (count / totalTransactions) * 100 : 0,
      };
    });

    const barLabels = pieItems.map((item) => item.employeeName);
    const barValues = pieItems.map((item) => item.value);

    const skip = (page - 1) * limit;

    const tableQuery = transactionRepo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.cashier', 'e')
      .where('t.isCompleted = :completed', { completed: true })
      .andWhere('t.createdAt BETWEEN :start AND :end', {
        start: startDate,
        end: endDate,
      })
      .andWhere('e.id IS NOT NULL')
      .select([
        't.id',
        't.createdAt',
        't.finalAmount',
        'e.id',
        'e.fullName',
      ])
      .orderBy('t.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [tableItems, totalCount] = await tableQuery.getManyAndCount();

    const tableTransactions = tableItems.map((t) => ({
      transactionId: t.id,
      occurredAt: t.createdAt,
      employeeId: t.cashier?.id || '',
      employeeName: t.cashier?.fullName || '',
      totalAmount: t.finalAmount,
      currency: 'VND' as const,
    }));

    const lastDataResult = await transactionRepo
      .createQueryBuilder('t')
      .select('MAX(t.updatedAt)', 'lastDataAt')
      .getRawOne();

    const lastDataAt = new Date(
      lastDataResult?.lastDataAt || new Date().toISOString(),
    );

    return {
      meta: {
        generatedAt: new Date(),
        lastDataAt,
      },
      pie: {
        total: totalTransactions,
        items: pieItems,
      },
      bar: {
        labels: barLabels,
        values: barValues,
      },
      table: {
        total: totalCount,
        page,
        limit,
        items: tableTransactions,
      },
    };
  }

  async getStockDashboard(
    bookStoreId: string,
    dto: GetStockDashboardQueryDto,
  ) {
    const dataSource = await this.tenantService.getTenantConnection({
      bookStoreId,
    });

    const {
      categoryIds,
      productType,
      search,
      sortBy = 'name',
      sortOrder = 'ASC',
      page = 1,
      limit = 20,
      productId,
      salesPeriod = PeriodType.DAY,
      importPeriod = PeriodType.MONTH,
      salesFrom,
      salesTo,
      importFrom,
      importTo,
    } = dto;

    const productRepo = dataSource.getRepository(Product);
    const inventoryRepo = dataSource.getRepository(Inventory);
    const inventoryLogRepo = dataSource.getRepository(InventoryLog);
    const transactionDetailRepo = dataSource.getRepository(TransactionDetail);
    const purchaseOrderDetailRepo = dataSource.getRepository(PurchaseOrderDetail);

    const queryBuilder = productRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.inventory', 'i')
      .where('p.deletedAt IS NULL');

    if (categoryIds && categoryIds.length > 0) {
      queryBuilder
        .leftJoin('p.categories', 'c')
        .andWhere('c.id IN (:...categoryIds)', { categoryIds });
    }

    if (productType) {
      queryBuilder.andWhere('p.type = :productType', { productType });
    }

    if (search) {
      queryBuilder.andWhere(
        '(p.name ILIKE :search OR p.sku ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const sortFieldMap: Record<string, string> = {
      name: 'p.name',
      sku: 'p.sku',
      stockQuantity: 'i.stockQuantity',
    };

    const sortField = sortFieldMap[sortBy] || 'p.name';
    queryBuilder.orderBy(sortField, sortOrder === 'DESC' ? 'DESC' : 'ASC');

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [products, totalCount] = await queryBuilder.getManyAndCount();

    const inventoryIds = products
      .map((p) => p.inventory?.id)
      .filter((id): id is string => !!id);

    const maxStockMap = new Map<string, number>();

    if (inventoryIds.length > 0) {
      const allLogs = await inventoryLogRepo
        .createQueryBuilder('il')
        .leftJoin('il.inventory', 'i')
        .select('il.inventory_id', 'inventoryId')
        .addSelect('il.quantityChange', 'quantityChange')
        .addSelect('il.createdAt', 'createdAt')
        .where('il.inventory_id IN (:...inventoryIds)', { inventoryIds })
        .orderBy('il.inventory_id', 'ASC')
        .addOrderBy('il.createdAt', 'ASC')
        .getRawMany();

      const logsByInventory = new Map<string, any[]>();
      for (const log of allLogs) {
        const invId = log.inventoryId;
        if (!logsByInventory.has(invId)) {
          logsByInventory.set(invId, []);
        }
        logsByInventory.get(invId)!.push(log);
      }

      for (const product of products) {
        const inventory = product.inventory;
        if (!inventory?.id) {
          maxStockMap.set(product.id, 100);
          continue;
        }

        const currentStock = inventory.stockQuantity || 0;
        const logs = logsByInventory.get(inventory.id) || [];

        let maxStock = currentStock;

        if (logs.length > 0) {
          let estimatedStock = currentStock;
          
          for (let i = logs.length - 1; i >= 0; i--) {
            const log = logs[i];
            estimatedStock -= parseFloat(log.quantityChange || '0');
            if (estimatedStock > maxStock) {
              maxStock = estimatedStock;
            }
          }

          maxStock = Math.max(maxStock, currentStock);
        }

        if (maxStock <= 0 || (logs.length === 0 && currentStock > 0)) {
          const defaultReference = Math.max(currentStock, 100);
          maxStock = Math.max(maxStock, defaultReference);
        }

        maxStockMap.set(product.id, maxStock > 0 ? maxStock : 100);
      }
    } else {
      for (const product of products) {
        maxStockMap.set(product.id, 100);
      }
    }

    const tableItems = products.map((product) => {
      const inventory = product.inventory;
      const stockQuantity = inventory?.stockQuantity || 0;

      let referenceStock = maxStockMap.get(product.id) || 100;

      if (referenceStock === stockQuantity && stockQuantity > 0) {
        referenceStock = Math.max(stockQuantity * 1.25, 100);
      }

      if (referenceStock <= 0) {
        referenceStock = stockQuantity > 0 ? Math.max(stockQuantity, 100) : 100;
      }

      const statusPercent =
        referenceStock > 0 ? (stockQuantity / referenceStock) * 100 : 0;

      let status: string;
      if (stockQuantity < 0) {
        status = 'Lỗi tồn kho';
      } else if (statusPercent < 20) {
        status = 'Sắp hết hàng';
      } else if (statusPercent <= 80) {
        status = 'Bình thường';
      } else {
        status = 'Dư hàng';
      }

      return {
        productId: product.id,
        sku: product.sku,
        name: product.name,
        imageUrl: product.imageUrl || undefined,
        stockQuantity,
        status,
        statusPercent: Math.round(statusPercent * 100) / 100,
      };
    });

    const lastInventoryResult = await inventoryRepo
      .createQueryBuilder('i')
      .select('MAX(i.updatedAt)', 'lastInventoryAt')
      .getRawOne();

    const lastProductResult = await productRepo
      .createQueryBuilder('p')
      .select('MAX(p.updatedAt)', 'lastProductAt')
      .getRawOne();

    const lastDataAt = new Date(
      Math.max(
        new Date(lastInventoryResult?.lastInventoryAt || 0).getTime(),
        new Date(lastProductResult?.lastProductAt || 0).getTime(),
      ),
    );

    const response: any = {
      meta: {
        generatedAt: new Date(),
        lastDataAt,
      },
      table: {
        total: totalCount,
        page,
        limit,
        items: tableItems,
      },
    };

    if (productId) {
      const product = await productRepo.findOne({
        where: { id: productId },
        relations: ['inventory'],
      });

      if (product) {
        const defaultSalesFrom = salesFrom || (() => {
          const date = new Date();
          date.setDate(date.getDate() - 7);
          return date;
        })();
        const defaultSalesTo = salesTo || new Date();

        let salesDateGroupBy = '';
        switch (salesPeriod) {
          case PeriodType.WEEK:
            salesDateGroupBy = `TO_CHAR(t.created_at, 'IYYY-"W"IW')`;
            break;
          case PeriodType.MONTH:
            salesDateGroupBy = `TO_CHAR(t.created_at, 'YYYY-MM')`;
            break;
          case PeriodType.DAY:
          default:
            salesDateGroupBy = `TO_CHAR(t.created_at, 'YYYY-MM-DD')`;
            break;
        }

        const salesQuery = transactionDetailRepo
          .createQueryBuilder('td')
          .leftJoin('td.transaction', 't')
          .leftJoin('td.product', 'p')
          .where('p.id = :productId', { productId })
          .andWhere('t.isCompleted = :completed', { completed: true })
          .andWhere('t.createdAt BETWEEN :start AND :end', {
            start: defaultSalesFrom,
            end: defaultSalesTo,
          })
          .select(salesDateGroupBy, 'label')
          .addSelect('SUM(td.quantity)', 'quantity')
          .groupBy('label')
          .orderBy('label', 'ASC');

        const salesResults = await salesQuery.getRawMany();

        const salesLabels = salesResults.map((r) => r.label || '').sort();
        const salesValues = salesLabels.map((label) => {
          const result = salesResults.find((r) => r.label === label);
          return parseInt(result?.quantity || '0');
        });

        response.salesChart = {
          labels: salesLabels,
          values: salesValues,
          productName: product.name,
        };

        const defaultImportFrom = importFrom || (() => {
          const date = new Date();
          date.setMonth(date.getMonth() - 6);
          return date;
        })();
        const defaultImportTo = importTo || new Date();

        let importDateGroupBy = '';
        switch (importPeriod) {
          case PeriodType.WEEK:
            importDateGroupBy = `TO_CHAR(po.created_at, 'IYYY-"W"IW')`;
            break;
          case PeriodType.DAY:
            importDateGroupBy = `TO_CHAR(po.created_at, 'YYYY-MM-DD')`;
            break;
          case PeriodType.MONTH:
          default:
            importDateGroupBy = `TO_CHAR(po.created_at, 'YYYY-MM')`;
            break;
        }

        const importQuery = purchaseOrderDetailRepo
          .createQueryBuilder('pod')
          .leftJoin('pod.purchaseOrder', 'po')
          .leftJoin('pod.product', 'p')
          .where('p.id = :productId', { productId })
          .andWhere('po.status IN (:...statuses)', {
            statuses: [PurchaseStatus.RECEIVED, PurchaseStatus.COMPLETED],
          })
          .andWhere('po.createdAt BETWEEN :start AND :end', {
            start: defaultImportFrom,
            end: defaultImportTo,
          })
          .select(importDateGroupBy, 'label')
          .addSelect('SUM(pod.quantity)', 'quantity')
          .groupBy('label')
          .orderBy('label', 'ASC');

        const importResults = await importQuery.getRawMany();

        const importLabels = importResults.map((r) => r.label || '').sort();
        const importValues = importLabels.map((label) => {
          const result = importResults.find((r) => r.label === label);
          return parseInt(result?.quantity || '0');
        });

        response.importChart = {
          labels: importLabels,
          values: importValues,
          productName: product.name,
        };
      }
    }

    return response;
  }
}
