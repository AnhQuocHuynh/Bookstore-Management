import { BookStoreId, Roles } from '@/common/decorators';
import {
  GetChartFinancialMetricsQueryDto,
  GetOverviewQueryDto,
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
  @Get('overview')
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
}
