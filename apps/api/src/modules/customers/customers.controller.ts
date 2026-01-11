import { BookStoreId, Roles } from '@/common/decorators';
import { CreateCustomerDto } from '@/common/dtos/customers/create-customer.dto';
import { GetCustomersQueryDto } from '@/common/dtos/customers/get-customers-query.dto';
import { CustomersService } from '@/modules/customers/customers.service';
import { UserRole } from '@/modules/users/enums';
import { Body, Controller, Get, HttpStatus, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam
} from '@nestjs/swagger';
// Import thêm
import { UpdateCustomerDto } from '@/common/dtos/customers';
import { Patch, Delete, Param, ParseUUIDPipe } from '@nestjs/common';

@Controller('customers')
@ApiTags('Khách hàng')
@ApiBearerAuth()
export class CustomersController {
  constructor(private readonly customersService: CustomersService) { }

  @ApiOperation({
    summary: 'Tạo mới khách hàng',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    example: {
      id: 'f51ff2f8-d601-408b-9f71-341244f72f88',
      email: 'ngocanhle2005@gmail.com',
      fullName: 'Ngọc Anh Lê',
      phoneNumber: '0393832145',
      address: '456 Đường Lê Lợi, Hồ Chí Minh',
      customerCode: 'NAL9635',
      note: null,
      customerType: 'regular',
      createdAt: '2026-01-08T08:57:28.956Z',
      updatedAt: '2026-01-08T08:57:28.956Z',
    },
  })
  @Post()
  @Roles(UserRole.OWNER, UserRole.EMPLOYEE)
  async createCustomer(
    @Body() createCustomerDto: CreateCustomerDto,
    @BookStoreId() bookStoreId: string,
  ) {
    return this.customersService.createCustomer(createCustomerDto, bookStoreId);
  }

  @ApiOperation({
    summary: 'Lấy danh sách khách hàng',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: [
      {
        id: '9f7ba8ab-c6a3-4536-a3af-fffaa6dd2f07',
        email: 'ngocanh@example.com',
        fullName: 'Lê Ngọc Ánh',
        phoneNumber: '0987654321',
        address: '123 Đường Nguyễn Trãi, Hà Nội',
        customerCode: 'KH0001',
        note: 'Thích sách giáo khoa',
        customerType: 'regular',
        createdAt: '2025-12-25T23:28:02.246Z',
        updatedAt: '2025-12-25T23:28:02.246Z',
      },
      {
        id: '4e675c75-8f53-48bb-9096-6c455f54bb92',
        email: 'thanh@example.com',
        fullName: 'Nguyễn Thanh Hùng',
        phoneNumber: '0912345678',
        address: '456 Đường Lê Lợi, Hồ Chí Minh',
        customerCode: 'KH0002',
        note: 'Khách VIP lâu năm',
        customerType: 'vip',
        createdAt: '2025-12-25T23:28:02.246Z',
        updatedAt: '2025-12-25T23:28:02.246Z',
      },
      {
        id: '8c5b808e-c4f2-4022-80b9-57c35ef15a37',
        email: 'linh@example.com',
        fullName: 'Trần Thị Linh',
        phoneNumber: '0901122334',
        address: '789 Đường Trần Phú, Đà Nẵng',
        customerCode: 'KH0003',
        note: 'Khách mua nhiều sách văn học',
        customerType: 'premium',
        createdAt: '2025-12-25T23:28:02.246Z',
        updatedAt: '2025-12-25T23:28:02.246Z',
      },
      {
        id: '83f3d496-be9b-4822-8068-557904454b7c',
        email: 'hien@example.com',
        fullName: 'Phạm Văn Hiển',
        phoneNumber: '0977766554',
        address: '321 Đường Lý Thường Kiệt, Hải Phòng',
        customerCode: 'KH0004',
        note: null,
        customerType: 'regular',
        createdAt: '2025-12-25T23:28:02.246Z',
        updatedAt: '2025-12-25T23:28:02.246Z',
      },
      {
        id: 'b5c20756-5199-4a8d-92da-246cf8a96bce',
        email: 'dat@example.com',
        fullName: 'Phạm Minh Đạt',
        phoneNumber: '0933445566',
        address: '654 Đường 30/4, Cần Thơ',
        customerCode: 'KH0005',
        note: 'Thường mua sách thiếu nhi',
        customerType: 'vip',
        createdAt: '2025-12-25T23:28:02.246Z',
        updatedAt: '2025-12-25T23:28:02.246Z',
      },
      {
        id: '85f4d1dd-db23-4c3e-8bfd-138b66bacdc0',
        email: 'hoa@example.com',
        fullName: 'Ngô Thị Hoa',
        phoneNumber: '0922334455',
        address: '12 Đường Hai Bà Trưng, Hà Nội',
        customerCode: 'KH0006',
        note: 'Mua sách văn học',
        customerType: 'regular',
        createdAt: '2025-12-25T23:28:02.246Z',
        updatedAt: '2025-12-25T23:28:02.246Z',
      },
      {
        id: '84a327ee-e44c-4db6-a8eb-f8aa08ff11d8',
        email: 'binh@example.com',
        fullName: 'Đặng Văn Bình',
        phoneNumber: '0911223344',
        address: '56 Đường Trần Hưng Đạo, Hồ Chí Minh',
        customerCode: 'KH0007',
        note: null,
        customerType: 'vip',
        createdAt: '2025-12-25T23:28:02.246Z',
        updatedAt: '2025-12-25T23:28:02.246Z',
      },
      {
        id: '3af77436-a735-466a-ad28-99da2dd7cdbf',
        email: 'trang@example.com',
        fullName: 'Phan Thị Trang',
        phoneNumber: '0988776655',
        address: '98 Đường Nguyễn Du, Đà Nẵng',
        customerCode: 'KH0008',
        note: 'Khách thân thiết',
        customerType: 'premium',
        createdAt: '2025-12-25T23:28:02.246Z',
        updatedAt: '2025-12-25T23:28:02.246Z',
      },
      {
        id: '23b47611-8ba8-4f95-89da-a3364db4c844',
        email: 'tuan@example.com',
        fullName: 'Nguyễn Tuấn Anh',
        phoneNumber: '0900998877',
        address: '23 Đường Lý Thái Tổ, Hải Phòng',
        customerCode: 'KH0009',
        note: null,
        customerType: 'regular',
        createdAt: '2025-12-25T23:28:02.246Z',
        updatedAt: '2025-12-25T23:28:02.246Z',
      },
      {
        id: 'ae2ed3f9-6e92-4c03-ad86-e002d60bdf3c',
        email: 'huyen@example.com',
        fullName: 'Lê Thị Huyền',
        phoneNumber: '0933557799',
        address: '45 Đường Phan Chu Trinh, Cần Thơ',
        customerCode: 'KH0010',
        note: 'Mua nhiều sách thiếu nhi',
        customerType: 'vip',
        createdAt: '2025-12-25T23:28:02.246Z',
        updatedAt: '2025-12-25T23:28:02.246Z',
      },
      {
        id: '395c905f-a881-4155-8c99-620d9c0267da',
        email: 'quang@example.com',
        fullName: 'Trần Quang Huy',
        phoneNumber: '0977886655',
        address: '67 Đường Trần Quang Khải, Hà Nội',
        customerCode: 'KH0011',
        note: null,
        customerType: 'regular',
        createdAt: '2025-12-25T23:28:02.246Z',
        updatedAt: '2025-12-25T23:28:02.246Z',
      },
      {
        id: '3d49d4da-7613-4dc4-97ae-bc715549cb36',
        email: 'mai@example.com',
        fullName: 'Nguyễn Thị Mai',
        phoneNumber: '0911445566',
        address: '89 Đường Hoàng Hoa Thám, Hồ Chí Minh',
        customerCode: 'KH0012',
        note: 'Thích sách kinh tế',
        customerType: 'premium',
        createdAt: '2025-12-25T23:28:02.246Z',
        updatedAt: '2025-12-25T23:28:02.246Z',
      },
      {
        id: '1b96d9de-ceb5-41da-9b5d-a4f9d8d8f5d0',
        email: 'phuc@example.com',
        fullName: 'Phạm Văn Phúc',
        phoneNumber: '0900667788',
        address: '34 Đường Võ Thị Sáu, Đà Nẵng',
        customerCode: 'KH0013',
        note: null,
        customerType: 'regular',
        createdAt: '2025-12-25T23:28:02.246Z',
        updatedAt: '2025-12-25T23:28:02.246Z',
      },
      {
        id: '2cd437c2-7ae1-4e36-bd60-b49e481e80d4',
        email: 'nga@example.com',
        fullName: 'Lê Thị Nga',
        phoneNumber: '0933665544',
        address: '12 Đường Trần Phú, Hải Phòng',
        customerCode: 'KH0014',
        note: 'Mua sách học sinh',
        customerType: 'vip',
        createdAt: '2025-12-25T23:28:02.246Z',
        updatedAt: '2025-12-25T23:28:02.246Z',
      },
      {
        id: '84c70455-17a8-4e85-a793-dcfe65634d3c',
        email: 'tien@example.com',
        fullName: 'Nguyễn Văn Tiến',
        phoneNumber: '0977998877',
        address: '56 Đường Nguyễn Văn Cừ, Cần Thơ',
        customerCode: 'KH0015',
        note: null,
        customerType: 'regular',
        createdAt: '2025-12-25T23:28:02.246Z',
        updatedAt: '2025-12-25T23:28:02.246Z',
      },
      {
        id: '8d356c6d-66ab-42da-8c65-57cc2e1ab006',
        email: 'huong@example.com',
        fullName: 'Trần Thị Hương',
        phoneNumber: '0911887766',
        address: '78 Đường Lê Lai, Hà Nội',
        customerCode: 'KH0016',
        note: 'Khách VIP lâu năm',
        customerType: 'vip',
        createdAt: '2025-12-25T23:28:02.246Z',
        updatedAt: '2025-12-25T23:28:02.246Z',
      },
      {
        id: '09309c3f-20a5-425c-85f3-aed04abba67c',
        email: 'khanh@example.com',
        fullName: 'Đỗ Minh Khánh',
        phoneNumber: '0900556677',
        address: '90 Đường Nguyễn Thị Minh Khai, Hồ Chí Minh',
        customerCode: 'KH0017',
        note: null,
        customerType: 'regular',
        createdAt: '2025-12-25T23:28:02.246Z',
        updatedAt: '2025-12-25T23:28:02.246Z',
      },
      {
        id: '499b45d1-6c42-4e8c-8147-d06431a59f76',
        email: 'an@example.com',
        fullName: 'Ngô Thị An',
        phoneNumber: '0933447788',
        address: '21 Đường Trần Bình Trọng, Đà Nẵng',
        customerCode: 'KH0018',
        note: 'Mua nhiều sách thiếu nhi',
        customerType: 'premium',
        createdAt: '2025-12-25T23:28:02.246Z',
        updatedAt: '2025-12-25T23:28:02.246Z',
      },
      {
        id: '839d8d1c-be45-4f0c-a1f2-b2719bae41f9',
        email: 'duc@example.com',
        fullName: 'Nguyễn Đức Duy',
        phoneNumber: '0977665544',
        address: '43 Đường Hoàng Diệu, Hải Phòng',
        customerCode: 'KH0019',
        note: null,
        customerType: 'regular',
        createdAt: '2025-12-25T23:28:02.246Z',
        updatedAt: '2025-12-25T23:28:02.246Z',
      },
      {
        id: '5d6150e6-5bd5-4386-be8d-9f8ac98441e1',
        email: 'lan@example.com',
        fullName: 'Phạm Thị Lan',
        phoneNumber: '0911226677',
        address: '65 Đường Cách Mạng Tháng 8, Cần Thơ',
        customerCode: 'KH0020',
        note: 'Khách thân thiết',
        customerType: 'vip',
        createdAt: '2025-12-25T23:28:02.246Z',
        updatedAt: '2025-12-25T23:28:02.246Z',
      },
    ],
  })
  @Get()
  @Roles(UserRole.OWNER, UserRole.EMPLOYEE)
  async getCustomers(
    @BookStoreId() bookStoreId: string,
    @Query() getCustomersQueryDto: GetCustomersQueryDto,
  ) {
    return this.customersService.getCustomers(
      bookStoreId,
      getCustomersQueryDto,
    );
  }

  @ApiOperation({
    summary: 'Cập nhật thông tin khách hàng',
    description: 'Chỉ OWNER hoặc EMPLOYEE mới có quyền thực hiện.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID của khách hàng cần sửa',
    example: 'f51ff2f8-d601-408b-9f71-341244f72f88',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cập nhật thành công',
  })
  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.EMPLOYEE)
  async updateCustomer(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @BookStoreId() bookStoreId: string,
  ) {
    return this.customersService.updateCustomer(id, updateCustomerDto, bookStoreId);
  }

  @ApiOperation({
    summary: 'Xóa khách hàng',
    description: 'Chỉ OWNER mới có quyền xóa khách hàng (Ví dụ logic nghiệp vụ).',
  })
  @ApiParam({
    name: 'id',
    description: 'ID của khách hàng cần xóa',
    example: 'f51ff2f8-d601-408b-9f71-341244f72f88',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Xóa thành công',
  })
  @Delete(':id')
  @Roles(UserRole.OWNER) // Giới hạn chỉ chủ cửa hàng mới được xóa
  async deleteCustomer(
    @Param('id', ParseUUIDPipe) id: string,
    @BookStoreId() bookStoreId: string,
  ) {
    return this.customersService.deleteCustomer(id, bookStoreId);
  }
}
