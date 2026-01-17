import { BookStoreId, Roles, UserSession } from '@/common/decorators';
import {
  AddDetailToTransactionDto,
  CreateTransactionDto,
  GetTransactionsQueryDto,
  UpdateTransactionDetailDto,
  UpdateTransactionDto,
} from '@/common/dtos';
import { ReturnDetailsDto } from '@/common/dtos/transactions/return-details.dto';
import { TUserSession } from '@/common/utils';
import { UserRole } from '@/modules/users/enums';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';

@Controller('transactions')
@ApiTags('Hoá đơn mua hàng')
@ApiBearerAuth()
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @ApiOperation({
    summary: 'Tạo mới hoá đơn giao dịch',
    description:
      'Đường dẫn này dùng để tạo mới hoá đơn giao dịch, chỉ có NHÂN VIÊN mới có quyền thực hiện.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Dữ liệu trả về.',
    example: {
      id: 'f87ef988-1055-41ce-bc47-5e21ab7b1c05',
      details: [
        {
          id: '58646389-845b-4339-9a35-41a774366b4d',
          quantity: 10,
          unitPrice: 100000,
          totalPrice: 1000000,
          createdAt: '2026-01-01T18:15:12.021Z',
          updatedAt: '2026-01-01T18:15:12.021Z',
        },
      ],
      totalAmount: 1000000,
      taxAmount: 100000,
      finalAmount: 1100000,
      paymentMethod: null,
      note: 'Ghi chú đơn mua',
      isCompleted: false,
      completedAt: null,
      createdAt: '2026-01-01T18:15:12.021Z',
      updatedAt: '2026-01-01T18:15:12.021Z',
    },
  })
  @ApiBody({
    type: CreateTransactionDto,
  })
  @Roles(UserRole.EMPLOYEE)
  @Post()
  async createTransaction(
    @Body() createTransactionDto: CreateTransactionDto,
    @UserSession() userSession: TUserSession,
  ) {
    return this.transactionsService.createTransaction(
      createTransactionDto,
      userSession,
    );
  }

  @ApiOperation({
    summary: 'Cập nhật hoá đơn mua hàng',
    description:
      'Đường dẫn này dùng để cập nhật hoá đơn mua hàng, chỉ có NHÂN VIÊN mới có quyền thực hiện.',
  })
  @ApiParam({
    name: 'id',
    description: 'Mã ID của đơn mua hàng',
    example: 'uuid-1',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Dữ liệu trả về',
    example: {
      id: '4ec0f892-2ef9-427d-9960-8afd459313ce',
      cashier: {
        id: '947f7b62-6a70-4fc7-9fe0-2620d006b4c1',
        email: 'emberrestaurant94@gmail.com',
        username: 'tunv20050841sjAF',
        password:
          '$2b$10$B92hSHzqQrYUsntJ2XCUr.vc5NzJT5ZqoIJ9oLQGjmN0RncQbHuqS',
        isActive: true,
        isFirstLogin: false,
        role: 'STAFF',
        employeeCode: 'STF0002',
        fullName: 'Nguyễn Văn Tú',
        address: '30 Lý Thường Kiệt, Hoàn Kiếm, Hà Nội',
        phoneNumber: '0393878913',
        birthDate: '2005-08-20T00:00:00.000Z',
        avatarUrl: 'https://github.com/shadcn.png',
        createdAt: '2025-12-06T18:58:39.384Z',
        updatedAt: '2026-01-01T08:51:51.696Z',
      },
      details: [
        {
          id: '808ca10e-bb94-4eac-a21f-f44d98f76039',
          quantity: 3,
          unitPrice: 750000,
          totalPrice: 2250000,
          createdAt: '2026-01-01T18:18:03.091Z',
          updatedAt: '2026-01-01T18:18:03.091Z',
        },
      ],
      totalAmount: 2250000,
      taxAmount: 225000,
      finalAmount: 2465000,
      paymentMethod: 'bank_transfer',
      note: 'Ghi chú đơn mua 3',
      isCompleted: true,
      completedAt: '2026-01-02T01:38:44.775Z',
      createdAt: '2026-01-01T18:18:03.091Z',
      updatedAt: '2026-01-01T18:38:43.992Z',
    },
  })
  @Roles(UserRole.EMPLOYEE)
  @Patch(':id')
  async updateTransaction(
    @Body() updateTransactionDto: UpdateTransactionDto,
    @UserSession() userSession: TUserSession,
    @Param('id', ParseUUIDPipe) transactionId: string,
  ) {
    return this.transactionsService.updateTransaction(
      transactionId,
      userSession,
      updateTransactionDto,
    );
  }

  @ApiOperation({
    summary: 'Cập nhật các chi tiết trong đơn mua hàng',
    description:
      'Đường dẫn này dùng để cập nhật các chi tiết trong đơn mua hàng, chỉ có NHÂN VIÊN mới có quyền thực hiện hành động này.',
  })
  @ApiParam({
    name: 'id',
    description: 'Mã ID của đơn hàng',
    example: 'uuid-1',
  })
  @ApiParam({
    name: 'transactionDetailId',
    description: 'Mã ID của chi tiết trong đơn mua hàng',
    example: 'uuid-2',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Dữ liệu trả về',
    example: {
      id: '4ec0f892-2ef9-427d-9960-8afd459313ce',
      cashier: {
        id: '947f7b62-6a70-4fc7-9fe0-2620d006b4c1',
        email: 'emberrestaurant94@gmail.com',
        username: 'tunv20050841sjAF',
        isActive: true,
        isFirstLogin: false,
        role: 'STAFF',
        employeeCode: 'STF0002',
        fullName: 'Nguyễn Văn Tú',
        address: '30 Lý Thường Kiệt, Hoàn Kiếm, Hà Nội',
        phoneNumber: '0393878913',
        birthDate: '2005-08-20T00:00:00.000Z',
        avatarUrl: 'https://github.com/shadcn.png',
        createdAt: '2025-12-06T18:58:39.384Z',
        updatedAt: '2026-01-01T08:51:51.696Z',
      },
      details: [
        {
          id: '808ca10e-bb94-4eac-a21f-f44d98f76039',
          quantity: 2,
          unitPrice: 10000,
          totalPrice: 5000,
          createdAt: '2026-01-01T18:18:03.091Z',
          updatedAt: '2026-01-01T19:13:31.041Z',
          product: {
            id: 'b101a1f4-3333-4c2a-9d11-aaaaaaaa0003',
            sku: 'BOOK-TD-003',
            name: 'Tắt đèn',
            description: 'Tiểu thuyết hiện thực phê phán của Ngô Tất Tố',
            price: 75000,
            imageUrl:
              'https://vjobgqypcdrvubesjnif.supabase.co/storage/v1/object/public/images/181344829.jpg',
            type: 'book',
            isActive: true,
            unit: 'cuốn',
            createdAt: '2025-12-15T04:10:00.000Z',
            updatedAt: '2025-12-15T04:10:00.000Z',
            inventory: {
              id: '333c4d5e-6f70-4802-aa12-3d4e5f6a7b02',
              stockQuantity: 30,
              displayQuantity: 2,
              availableQuantity: 28,
              costPrice: 45000,
              createdAt: '2025-12-12T07:45:00.000Z',
              updatedAt: '2025-12-15T05:45:00.000Z',
            },
            book: {
              id: 'c001a001-3333-4aaa-8bbb-000000000003',
              isbn: '9786040010035',
              publicationDate: '2015-03-20',
              edition: 'Tái bản lần 2',
              language: 'Tiếng Việt',
              coverImage:
                'https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1479993956i/13147425.jpg',
              status: 'available',
              createdAt: '2025-12-15T05:10:00.000Z',
              updatedAt: '2025-12-15T05:10:00.000Z',
            },
            deletedAt: null,
          },
        },
      ],
      totalAmount: 20000,
      taxAmount: 500,
      finalAmount: 5500,
      paymentMethod: 'bank_transfer',
      note: 'Ghi chú đơn mua 3',
      isCompleted: true,
      completedAt: '2026-01-02T01:38:44.775Z',
      createdAt: '2026-01-01T18:18:03.091Z',
      updatedAt: '2026-01-01T19:13:31.041Z',
    },
  })
  @Roles(UserRole.EMPLOYEE)
  @Patch(':id/details/:transactionDetailId')
  async updateTransactionDetail(
    @Param('id', ParseUUIDPipe) transactionId: string,
    @Param('transactionDetailId', ParseUUIDPipe) transactionDetailId: string,
    @Body() updateTransactionDetailDto: UpdateTransactionDetailDto,
    @UserSession() userSession: TUserSession,
  ) {
    return this.transactionsService.updateTransactionDetail(
      transactionId,
      transactionDetailId,
      userSession,
      updateTransactionDetailDto,
    );
  }

  @ApiOperation({
    summary: 'Thêm chi tiết hoá đơn vào hoá đơn',
    description:
      'Đường dẫn này dùng để thêm chi tiết hoá đơn vào hoá đơn, chỉ có NHÂN VIÊN mới có quyền thực hiện.',
  })
  @ApiParam({
    name: 'id',
    description: 'Mã ID của hoá đơn',
    example: 'id-1',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    example: {
      id: '4ec0f892-2ef9-427d-9960-8afd459313ce',
      cashier: {
        id: '947f7b62-6a70-4fc7-9fe0-2620d006b4c1',
        email: 'emberrestaurant94@gmail.com',
        username: 'tunv20050841sjAF',
        isActive: true,
        isFirstLogin: false,
        role: 'STAFF',
        employeeCode: 'STF0002',
        fullName: 'Nguyễn Văn Tú',
        address: '30 Lý Thường Kiệt, Hoàn Kiếm, Hà Nội',
        phoneNumber: '0393878913',
        birthDate: '2005-08-20T00:00:00.000Z',
        avatarUrl: 'https://github.com/shadcn.png',
        createdAt: '2025-12-06T18:58:39.384Z',
        updatedAt: '2026-01-01T08:51:51.696Z',
      },
      details: [
        {
          id: '808ca10e-bb94-4eac-a21f-f44d98f76039',
          quantity: 2,
          unitPrice: 10000,
          totalPrice: 5000,
          createdAt: '2026-01-01T18:18:03.091Z',
          updatedAt: '2026-01-01T19:13:31.041Z',
          product: {
            id: 'b101a1f4-3333-4c2a-9d11-aaaaaaaa0003',
            sku: 'BOOK-TD-003',
            name: 'Tắt đèn',
            description: 'Tiểu thuyết hiện thực phê phán của Ngô Tất Tố',
            price: 75000,
            imageUrl:
              'https://vjobgqypcdrvubesjnif.supabase.co/storage/v1/object/public/images/181344829.jpg',
            type: 'book',
            isActive: true,
            unit: 'cuốn',
            createdAt: '2025-12-15T04:10:00.000Z',
            updatedAt: '2025-12-15T04:10:00.000Z',
            inventory: {
              id: '333c4d5e-6f70-4802-aa12-3d4e5f6a7b02',
              stockQuantity: 30,
              displayQuantity: 2,
              availableQuantity: 28,
              costPrice: 45000,
              createdAt: '2025-12-12T07:45:00.000Z',
              updatedAt: '2025-12-15T05:45:00.000Z',
            },
            book: {
              id: 'c001a001-3333-4aaa-8bbb-000000000003',
              isbn: '9786040010035',
              publicationDate: '2015-03-20',
              edition: 'Tái bản lần 2',
              language: 'Tiếng Việt',
              coverImage:
                'https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1479993956i/13147425.jpg',
              status: 'available',
              createdAt: '2025-12-15T05:10:00.000Z',
              updatedAt: '2025-12-15T05:10:00.000Z',
            },
            deletedAt: null,
          },
        },
        {
          id: '24280d91-0ff4-41a5-82ef-11e880850499',
          quantity: 3,
          unitPrice: 85000,
          totalPrice: 255000,
          createdAt: '2026-01-01T19:26:49.137Z',
          updatedAt: '2026-01-01T19:26:49.137Z',
          product: {
            id: 'b101a1f4-1111-4c2a-9d11-aaaaaaaa0001',
            sku: 'BOOK-NCLCC-001',
            name: 'Những chiếc lá cuối cùng',
            description:
              'Tác phẩm nổi tiếng của O. Henry về tình người và hy vọng',
            price: 85000,
            imageUrl:
              'https://vjobgqypcdrvubesjnif.supabase.co/storage/v1/object/public/images/181344829.jpg',
            type: 'book',
            isActive: true,
            unit: 'cuốn',
            createdAt: '2025-12-15T04:00:00.000Z',
            updatedAt: '2025-12-15T04:00:00.000Z',
            inventory: {
              id: '111a2b3c-4d5e-4f60-8a90-1b2c3d4e5f60',
              stockQuantity: 120,
              displayQuantity: 5,
              availableQuantity: 115,
              costPrice: 150000,
              createdAt: '2025-12-10T02:00:00.000Z',
              updatedAt: '2025-12-15T03:00:00.000Z',
            },
            book: {
              id: 'c001a001-1111-4aaa-8bbb-000000000001',
              isbn: '9786040010011',
              publicationDate: '2018-06-15',
              edition: 'Tái bản lần 3',
              language: 'Tiếng Việt',
              coverImage:
                'https://tailieumoi.vn/storage/uploads/images/31181/56ce8d9c5c57995499ea53b2779e27d3-1-1653996808.png',
              status: 'available',
              createdAt: '2025-12-15T05:00:00.000Z',
              updatedAt: '2025-12-15T05:00:00.000Z',
            },
            deletedAt: null,
          },
        },
        {
          id: '6943fe75-26a1-48ed-9f91-43dc5578c759',
          quantity: 6,
          unitPrice: 65000,
          totalPrice: 390000,
          createdAt: '2026-01-01T19:32:29.387Z',
          updatedAt: '2026-01-01T19:33:11.580Z',
          product: {
            id: 'b101a1f4-4444-4c2a-9d11-aaaaaaaa0004',
            sku: 'BOOK-DRM-004',
            name: 'Doraemon và binh đoàn người sắt',
            description: 'Tập truyện Doraemon nổi tiếng của Fujiko F. Fujio',
            price: 65000,
            imageUrl:
              'https://vjobgqypcdrvubesjnif.supabase.co/storage/v1/object/public/images/181344829.jpg',
            type: 'book',
            isActive: true,
            unit: 'cuốn',
            createdAt: '2025-12-15T04:15:00.000Z',
            updatedAt: '2025-12-15T04:15:00.000Z',
            inventory: {
              id: '444d5e6f-7081-4903-bb23-4e5f6a7b8c03',
              stockQuantity: 200,
              displayQuantity: 10,
              availableQuantity: 190,
              costPrice: 300000,
              createdAt: '2025-12-13T01:15:00.000Z',
              updatedAt: '2025-12-15T06:15:00.000Z',
            },
            book: {
              id: 'c001a001-4444-4aaa-8bbb-000000000004',
              isbn: '9786040010042',
              publicationDate: '2014-07-10',
              edition: 'Bản thiếu nhi',
              language: 'Tiếng Việt',
              coverImage:
                'https://product.hstatic.net/200000671157/product/2024_06_10_16_12_06_1-390x510__2__576aea02ab4447279979f397e155014b_compact.jpg',
              status: 'available',
              createdAt: '2025-12-15T05:15:00.000Z',
              updatedAt: '2025-12-15T05:15:00.000Z',
            },
            deletedAt: null,
          },
        },
      ],
      totalAmount: 665000,
      taxAmount: 65000,
      finalAmount: 715000,
      paymentMethod: 'bank_transfer',
      note: 'Ghi chú đơn mua 3',
      isCompleted: true,
      completedAt: '2026-01-02T01:38:44.775Z',
      createdAt: '2026-01-01T18:18:03.091Z',
      updatedAt: '2026-01-01T19:33:11.580Z',
    },
  })
  @Roles(UserRole.EMPLOYEE)
  @Post(':id/details')
  async addDetailToTransaction(
    @Body() addDetailToTransactionDto: AddDetailToTransactionDto,
    @Param('id', ParseUUIDPipe) transactionId: string,
    @UserSession() userSession: TUserSession,
  ) {
    return this.transactionsService.addDetailToTransaction(
      transactionId,
      userSession,
      addDetailToTransactionDto,
    );
  }

  @ApiOperation({
    summary: 'Lấy danh sách hoá đơn',
    description:
      'Đường dẫn này dùng để lấy danh sách hoá đơn (có lọc), cho phép cả CHỦ hoặc NHÂN VIÊN cửa hàng có quyền thực hiện.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: [
      {
        id: '04b4c075-4ef9-4628-afa9-ec5c6e9fa8bc',
        cashier: {
          id: '63b0b7de-6501-49e3-8a0d-cb0f6da57945',
          email: 'employee020@bookstore.com',
          username: 'emp020',
          isActive: true,
          isFirstLogin: false,
          role: 'CASHIER',
          employeeCode: 'EMP020',
          fullName: 'Hoàng Thị Thu ngân',
          address: '913 Lạc Long Quân, Quận 11, TP.HCM',
          phoneNumber: '+84901237020',
          birthDate: '1993-03-09T17:00:00.000Z',
          avatarUrl: null,
          createdAt: '2026-01-15T06:15:37.921Z',
          updatedAt: '2026-01-15T06:15:37.921Z',
        },
        details: [],
        totalAmount: 225000,
        taxAmount: 22500,
        finalAmount: 247500,
        paymentMethod: 'e_wallet',
        note: null,
        paidAmount: 247500,
        changeAmount: 0,
        isCompleted: true,
        completedAt: '2026-01-19T07:30:00.000Z',
        createdAt: '2026-01-19T07:30:00.000Z',
        updatedAt: '2026-01-19T07:30:00.000Z',
        returnOrders: [],
        customer: {
          id: '4ed65c0f-90a2-49ca-95eb-b5077a75c6e8',
          email: 'customer029@example.com',
          fullName: 'Võ Văn Khách hàng',
          phoneNumber: '+84901238029',
          address: '902 Huỳnh Tấn Phát, Quận 7, TP.HCM',
          customerCode: 'CUS029',
          note: 'Khách hàng VIP',
          customerType: 'vip',
          createdAt: '2026-01-15T06:18:05.545Z',
          updatedAt: '2026-01-15T06:18:05.545Z',
        },
      },
      {
        id: '42e4c245-8aca-4433-9601-11d06e373579',
        cashier: {
          id: 'cc0cb7c4-ceee-4ce2-adbb-7f745a467d02',
          email: 'employee016@bookstore.com',
          username: 'emp016',
          isActive: true,
          isFirstLogin: false,
          role: 'CASHIER',
          employeeCode: 'EMP016',
          fullName: 'Lê Thị Thu ngân',
          address: '579 Nguyễn Văn Nghi, Gò Vấp, TP.HCM',
          phoneNumber: '+84901237016',
          birthDate: '1991-07-16T17:00:00.000Z',
          avatarUrl: null,
          createdAt: '2026-01-15T06:15:37.921Z',
          updatedAt: '2026-01-15T06:15:37.921Z',
        },
        details: [],
        totalAmount: 290000,
        taxAmount: 29000,
        finalAmount: 319000,
        paymentMethod: 'card',
        note: null,
        paidAmount: 319000,
        changeAmount: 0,
        isCompleted: true,
        completedAt: '2026-01-19T03:00:00.000Z',
        createdAt: '2026-01-19T03:00:00.000Z',
        updatedAt: '2026-01-19T03:00:00.000Z',
        returnOrders: [],
        customer: {
          id: '50f0c7d5-93a8-4021-a164-9768492486d8',
          email: 'customer028@example.com',
          fullName: 'Phan Thị Khách hàng',
          phoneNumber: '+84901238028',
          address: '891 Nguyễn Thị Thập, Quận 7, TP.HCM',
          customerCode: 'CUS028',
          note: null,
          customerType: 'regular',
          createdAt: '2026-01-15T06:18:05.545Z',
          updatedAt: '2026-01-15T06:18:05.545Z',
        },
      },
    ],
  })
  @Roles(UserRole.EMPLOYEE, UserRole.OWNER)
  @Get()
  async getTransactions(
    @Query() getTransactionsQueryDto: GetTransactionsQueryDto,
    @BookStoreId() bookStoreId: string,
  ) {
    return this.transactionsService.getTransactions(
      getTransactionsQueryDto,
      bookStoreId,
    );
  }

  @ApiOperation({
    summary: 'Lấy chi tiết hoá đơn',
    description:
      'Đường dẫn này dùng để lấy chi tiết hoá đơn, cho phép cả NHÂN VIÊN và CHỦ nhà sách thực hiện.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID của hoá đơn',
    example: 'id-1',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: {
      id: '42e4c245-8aca-4433-9601-11d06e373579',
      cashier: {
        id: 'cc0cb7c4-ceee-4ce2-adbb-7f745a467d02',
        email: 'employee016@bookstore.com',
        username: 'emp016',
        isActive: true,
        isFirstLogin: false,
        role: 'CASHIER',
        employeeCode: 'EMP016',
        fullName: 'Lê Thị Thu ngân',
        address: '579 Nguyễn Văn Nghi, Gò Vấp, TP.HCM',
        phoneNumber: '+84901237016',
        birthDate: '1991-07-16T17:00:00.000Z',
        avatarUrl: null,
        createdAt: '2026-01-15T06:15:37.921Z',
        updatedAt: '2026-01-15T06:15:37.921Z',
      },
      details: [],
      totalAmount: 290000,
      taxAmount: 29000,
      finalAmount: 319000,
      paymentMethod: 'card',
      note: null,
      paidAmount: 319000,
      changeAmount: 0,
      isCompleted: true,
      completedAt: '2026-01-19T03:00:00.000Z',
      createdAt: '2026-01-19T03:00:00.000Z',
      updatedAt: '2026-01-19T03:00:00.000Z',
      returnOrders: [],
      customer: {
        id: '50f0c7d5-93a8-4021-a164-9768492486d8',
        email: 'customer028@example.com',
        fullName: 'Phan Thị Khách hàng',
        phoneNumber: '+84901238028',
        address: '891 Nguyễn Thị Thập, Quận 7, TP.HCM',
        customerCode: 'CUS028',
        note: null,
        customerType: 'regular',
        createdAt: '2026-01-15T06:18:05.545Z',
        updatedAt: '2026-01-15T06:18:05.545Z',
      },
    },
  })
  @Get(':id')
  async getTransaction(
    @Param('id', ParseUUIDPipe) id: string,
    @BookStoreId() bookStoreId: string,
  ) {
    return this.transactionsService.getTransaction(id, bookStoreId);
  }

  @ApiOperation({
    summary: 'Trả về chi tiết các thành phần trong hoá đơn',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    example: {
      finalAmount: 2475000,
      taxAmount: 225000,
      totalAmount: 2250000,
    },
  })
  @Roles(UserRole.EMPLOYEE)
  @Post('details')
  async returnDetails(
    @Body() returnDetailsDto: ReturnDetailsDto,
    @BookStoreId() bookStoreId: string,
  ) {
    return this.transactionsService.returnDetails(
      returnDetailsDto,
      bookStoreId,
    );
  }
}
