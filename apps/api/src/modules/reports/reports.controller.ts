import { BookStoreId, Roles } from '@/common/decorators';
import {
  GetChartFinancialMetricsQueryDto,
  GetOverviewQueryDto,
  GetRevenueDashboardQueryDto,
  GetEmployeesDashboardQueryDto,
} from '@/common/dtos';
import { UserRole } from '@/modules/users/enums';
import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';

@Controller('reports')
@ApiTags('Báo cáo thống kê')
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('overview')
  @ApiOperation({
    summary: 'Lấy dữ liệu tổng quan kinh doanh',
    description: `
      Trả về dữ liệu 5 card dashboard gồm:
      - profit: lợi nhuận
      - revenue: tổng tiền bán
      - transactions: số hóa đơn hoàn tất
      - items_sold: tổng số sản phẩm bán ra, phân loại theo loại sản phẩm
      - expenses: tổng chi phí
      Có tính growth_percent so với kỳ trước.
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: {
      timestamp: '2025-12-18T07:30:00.000Z',
      overview: {
        profit: {
          value: 1200000,
          currency: 'VND',
          growth_percent: 5.2,
          note: 'Lợi nhuận = Doanh thu - Giá vốn',
        },
        revenue: {
          value: 3625000,
          currency: 'VND',
          growth_percent: 4.8,
        },
        transactions: {
          count: 76,
          growth_percent: 2.5,
        },
        items_sold: {
          total: 276,
          breakdown: {
            book: 150,
            stationery: 126,
            other: 0,
          },
        },
        expenses: {
          total: 2425000,
          currency: 'VND',
          breakdown: {
            purchase_cost: 2000000,
            service_fee: 425000,
          },
        },
      },
    },
  })
  @Roles(UserRole.EMPLOYEE, UserRole.OWNER)
  async getOverview(
    @BookStoreId() bookStoreId: string,
    @Query() getOverviewQueryDto: GetOverviewQueryDto,
  ) {
    return this.reportsService.getOverview(bookStoreId, getOverviewQueryDto);
  }

  @ApiOperation({
    summary: 'Lấy dữ liệu biểu đồ tài chính (Doanh thu & Lợi nhuận)',
    description:
      'Trả về JSON để vẽ chart đường/cột tài chính theo ngày/tuần/tháng',
  })
  @ApiResponse({
    status: 200,
    description: 'Dữ liệu chart tài chính trả về thành công',
    schema: {
      example: {
        labels: ['2025-12-01', '2025-12-02', '2025-12-03'],
        datasets: [
          { name: 'Doanh thu', values: [500000, 450000, 600000] },
          { name: 'Lợi nhuận', values: [200000, 150000, 250000] },
        ],
      },
    },
  })
  @Roles(UserRole.OWNER, UserRole.EMPLOYEE)
  @Get('chart-financial-metrics')
  async getChartFinancialMetrics(
    @BookStoreId() bookStoreId: string,
    @Query() getChartFinancialMetricsQueryDto: GetChartFinancialMetricsQueryDto,
  ) {
    return this.reportsService.getChartFinancialMetrics(
      bookStoreId,
      getChartFinancialMetricsQueryDto,
    );
  }

  @Get('chart-product-metrics')
  @ApiOperation({
    summary: 'Lấy dữ liệu biểu đồ sản lượng (Tổng sản phẩm, Sách, VPP)',
    description: 'Trả về JSON để vẽ chart sản lượng theo ngày/tuần/tháng',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    schema: {
      example: {
        labels: ['2025-12-01', '2025-12-02', '2025-12-03'],
        datasets: [
          { name: 'Tổng sản phẩm', values: [35, 27, 42] },
          { name: 'Sách', values: [20, 15, 25] },
          { name: 'Văn phòng phẩm', values: [15, 12, 17] },
          { name: 'Khác', values: [15, 12, 17] },
        ],
      },
    },
  })
  async getProductChart(
    @BookStoreId() bookStoreId: string,
    @Query() query: GetChartFinancialMetricsQueryDto,
  ) {
    return this.reportsService.getProductChart(bookStoreId, query);
  }

  @Get('revenue/dashboard')
  @ApiOperation({
    summary: 'Lấy dữ liệu dashboard doanh thu đầy đủ',
    description: `
      Trả về tất cả dữ liệu cần thiết cho trang dashboard doanh thu:
      - cards: các metric cards (revenue, profit, orders, itemsSold, purchaseSpend, serviceFee)
      - pie: biểu đồ tròn top sản phẩm theo doanh thu
      - line: biểu đồ đường doanh thu theo thời gian, nhóm theo category
      - top: danh sách top sản phẩm bán chạy
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Dữ liệu dashboard doanh thu trả về thành công',
    schema: {
      example: {
        meta: {
          generatedAt: '2025-12-18T07:30:00.000Z',
          lastDataAt: '2025-12-18T07:25:00.000Z',
        },
        cards: {
          revenue: { value: 3625000, currency: 'VND', growthPercent: 4.8, growthAbs: 175000 },
          profit: { value: 1200000, currency: 'VND', growthPercent: 5.2, growthAbs: 60000, note: 'Lợi nhuận = Doanh thu - Giá vốn' },
          orders: { count: 76, growthPercent: 2.5, growthAbs: 2 },
          itemsSold: { total: 276, growthPercent: 3.1, growthAbs: 8 },
          purchaseSpend: { total: 2000000, currency: 'VND', growthPercent: 4.5, growthAbs: 90000 },
          serviceFee: { total: 0, currency: 'VND' },
        },
        pie: {
          total: 3600000,
          items: [
            { productId: 'uuid1', name: 'Tập 100 trang', sku: '7K9P-2WXM', imageUrl: 'https://...', value: 1200000, percent: 33.3 },
          ],
        },
        line: {
          labels: ['2025-12-01', '2025-12-02', '2025-12-03'],
          datasets: [
            { name: 'Sách văn học', values: [500000, 450000, 600000] },
            { name: 'Văn phòng phẩm', values: [300000, 350000, 400000] },
          ],
        },
        top: [
          { productId: 'uuid1', name: 'Tập 100 trang', sku: '7K9P-2WXM', imageUrl: 'https://...', revenue: 1200000, percent: 33.1 },
        ],
      },
    },
  })
  @Roles(UserRole.EMPLOYEE, UserRole.OWNER)
  async getRevenueDashboard(
    @BookStoreId() bookStoreId: string,
    @Query() getRevenueDashboardQueryDto: GetRevenueDashboardQueryDto,
  ) {
    return this.reportsService.getRevenueDashboard(
      bookStoreId,
      getRevenueDashboardQueryDto,
    );
  }

  @Get('employees/dashboard')
  @ApiOperation({
    summary: 'Lấy dữ liệu dashboard hiệu suất nhân viên',
    description: `
      Trả về tất cả dữ liệu cần thiết cho trang dashboard hiệu suất nhân viên:
      - pie: biểu đồ tròn phần trăm giao dịch theo nhân viên
      - bar: biểu đồ cột số lượng giao dịch theo nhân viên
      - table: bảng danh sách giao dịch (có phân trang)
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Dữ liệu dashboard nhân viên trả về thành công',
    schema: {
      example: {
        meta: {
          generatedAt: '2025-12-18T07:30:00.000Z',
          lastDataAt: '2025-12-18T07:25:00.000Z',
        },
        pie: {
          total: 729,
          items: [
            { employeeId: 'uuid1', employeeName: 'Nhân viên A', avatarUrl: 'https://...', value: 138, percent: 18.9 },
          ],
        },
        bar: {
          labels: ['Nhân viên A', 'Nhân viên B'],
          values: [138, 121],
        },
        table: {
          total: 729,
          page: 1,
          limit: 20,
          items: [
            { transactionId: 'uuid1', occurredAt: '2025-12-18T09:03:35.000Z', employeeId: 'uuid1', employeeName: 'Nhân viên A', totalAmount: 217500, currency: 'VND' },
          ],
        },
      },
    },
  })
  @Roles(UserRole.EMPLOYEE, UserRole.OWNER)
  async getEmployeesDashboard(
    @BookStoreId() bookStoreId: string,
    @Query() getEmployeesDashboardQueryDto: GetEmployeesDashboardQueryDto,
  ) {
    return this.reportsService.getEmployeesDashboard(
      bookStoreId,
      getEmployeesDashboardQueryDto,
    );
  }
}
