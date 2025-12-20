import { Public, Roles, UserSession } from '@/common/decorators';
import { TUserSession } from '@/common/utils';
import { CreateBookStoreDto, UpdateBookStoreDto } from '@/database/main/dto';
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
import { BookStoreService } from './bookstore.service';
import {
  GetBookStoresQueryDto,
  GetEmployeesOfBookStoreQueryDto,
  GetMyBookStoresQueryDto,
} from '@/common/dtos/bookstores';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller('bookstores')
@ApiTags('Nhà sách')
export class BookStoreController {
  constructor(private readonly bookStoreService: BookStoreService) {}

  @ApiOperation({
    summary: 'Lấy danh sách cửa hàng',
    description: 'Đường dẫn này dùng để lấy danh sách cửa hàng.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: [
      {
        id: '99c31ece-f824-4a34-a965-420c4c86b039',
        code: 'NHASAC-F050',
        name: 'Nhà sách ABC',
        address: 'Hồ Chí Minh',
        phoneNumber: '0393877632',
        logoUrl:
          'https://res.cloudinary.com/dct7bksvq/image/upload/v1763647010/tqyvkxk5bndg3rfdfilz.png',
        isActive: true,
        createdAt: '2025-11-19T18:36:47.986Z',
        updatedAt: '2025-11-20T06:59:01.434Z',
      },
    ],
  })
  @Public()
  @Get()
  async getBookStores(@Query() getBookStoresQueryDto: GetBookStoresQueryDto) {
    return this.bookStoreService.getBookStores(getBookStoresQueryDto);
  }

  @ApiOperation({
    summary: 'Lấy chi tiết thông tin cửa hàng',
    description: 'Đường dẫn này dùng để lấy chi tiết thông tin cửa hàng.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: {
      id: '99c31ece-f824-4a34-a965-420c4c86b039',
      code: 'NHASAC-F050',
      name: 'Nhà sách ABC',
      address: 'Hồ Chí Minh',
      phoneNumber: '0393877632',
      logoUrl:
        'https://res.cloudinary.com/dct7bksvq/image/upload/v1763647010/tqyvkxk5bndg3rfdfilz.png',
      isActive: true,
      user: {
        id: 'fa069344-1227-4a18-a111-d639940e9ac8',
        email: 'lengocanhpyne363@gmail.com',
        fullName: 'ABC',
        phoneNumber: '0393173631',
        avatarUrl: null,
        birthDate: '2025-11-22T09:41:22.031Z',
        address: 'abc',
        isActive: true,
        isEmailVerified: true,
        role: 'OWNER',
        createdAt: '2025-11-19T18:36:47.531Z',
        updatedAt: '2025-11-22T09:42:38.128Z',
      },
      createdAt: '2025-11-19T18:36:47.986Z',
      updatedAt: '2025-11-20T06:59:01.434Z',
    },
  })
  @ApiParam({
    name: 'id',
    description: 'Id của cửa hàng.',
    example: '99c31ece-f824-4a34-a965-420c4c86b039',
  })
  @ApiBearerAuth()
  @Get('detail/:id')
  async getBookStore(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookStoreService.getBookStore(id);
  }

  @ApiOperation({
    summary: 'Lấy danh sách nhân viên của cửa hàng',
    description:
      'Đường dẫn này dùng để lấy danh sách nhân viên của cửa hàng, chỉ có OWNER mới có quyền thực hiện điều này.',
  })
  @ApiParam({
    name: 'id',
    description: 'Id nhà sách',
    example: '99c31ece-f824-4a34-a965-420c4c86b039',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: [
      {
        id: '7a3ef648-3a4d-497d-80c0-68c38a148015',
        email: 'ngocanhsedev2005@gmail.com',
        username: 'nunth200508)HUvl',
        isActive: true,
        isFirstLogin: true,
        role: 'STAFF',
        fullName: 'ADC',
        address: 'abcdef',
        phoneNumber: '0393878912',
        birthDate: '2005-08-20T00:00:00.000Z',
        avatarUrl: null,
        createdAt: '2025-11-22T08:22:17.559Z',
        updatedAt: '2025-11-22T11:08:46.770Z',
      },
      {
        id: '947f7b62-6a70-4fc7-9fe0-2620d006b4c1',
        email: 'emberrestaurant94@gmail.com',
        username: 'tunv20050841sjAF',
        isActive: true,
        isFirstLogin: false,
        role: 'STAFF',
        fullName: 'Nguyễn Văn Tú',
        address: null,
        phoneNumber: '0393878913',
        birthDate: '2005-08-20T00:00:00.000Z',
        avatarUrl: null,
        createdAt: '2025-12-06T18:58:39.384Z',
        updatedAt: '2025-12-06T19:02:31.751Z',
      },
    ],
  })
  @ApiBearerAuth()
  @Get(':id/employees')
  @Roles(UserRole.OWNER)
  async getEmployeesOfBookStore(
    @Param('id', ParseUUIDPipe) bookStoreId: string,
    @Query() getEmployeesOfBookStoreQueryDto: GetEmployeesOfBookStoreQueryDto,
    @UserSession() userSession: TUserSession,
  ) {
    return this.bookStoreService.getEmployeesOfBookStore(
      userSession,
      bookStoreId,
      getEmployeesOfBookStoreQueryDto,
    );
  }

  @ApiOperation({
    summary: 'Tạo mới cửa hàng (chi nhánh mới).',
    description:
      'Đường dẫn này dùng để tạo mới cửa hàng, chỉ có OWNER mới có quyền thực hiện hành động này.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: {
      message: 'Đã tạo mới nhà sách thành công.',
      data: {
        id: '72ba4f79-6642-4da4-990c-bf1180e2ab65',
        code: 'NHASAC-C944',
        name: 'Nhà sách Kim Đồng',
        address: 'Hà Nội',
        phoneNumber: '+84387643543',
        logoUrl: null,
        isActive: true,
        user: {
          id: 'fa069344-1227-4a18-a111-d639940e9ac8',
          email: 'lengocanhpyne363@gmail.com',
          fullName: 'ABC',
          phoneNumber: '0393173631',
          avatarUrl: null,
          birthDate: '2025-11-22T09:41:22.031Z',
          address: 'abc',
          isActive: true,
          isEmailVerified: true,
          role: 'OWNER',
          createdAt: '2025-11-19T18:36:47.531Z',
          updatedAt: '2025-11-22T09:42:38.128Z',
        },
        createdAt: '2025-12-08T18:15:39.078Z',
        updatedAt: '2025-12-08T18:15:39.383Z',
      },
    },
  })
  @ApiBody({
    type: CreateBookStoreDto,
  })
  @ApiBearerAuth()
  @Post()
  @Roles(UserRole.OWNER)
  async createBookStore(
    @UserSession() userSession: TUserSession,
    @Body() createBookStoreDto: CreateBookStoreDto,
  ) {
    return this.bookStoreService.createBookStore(
      userSession,
      createBookStoreDto,
    );
  }

  @ApiOperation({
    summary: 'Cập nhật thông tin nhà sách.',
    description:
      'Đường dẫn này dùng để cập nhật thông tin nhà sách, chỉ có OWNER mới có quyền thực hiện hành động này.',
  })
  @ApiParam({
    name: 'id',
    description: 'Id nhà sách',
    example: '99c31ece-f824-4a34-a965-420c4c86b039',
  })
  @ApiBody({
    type: UpdateBookStoreDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: {
      message: 'Thông tin nhà sách đã được cập nhật thành công.',
      data: {
        id: '99c31ece-f824-4a34-a965-420c4c86b039',
        code: 'NHASAC-F050',
        name: 'Nhà sách ABC',
        address: 'Phú Yên',
        phoneNumber: '0393877632',
        logoUrl:
          'https://res.cloudinary.com/dct7bksvq/image/upload/v1763647010/tqyvkxk5bndg3rfdfilz.png',
        isActive: true,
        user: {
          id: 'fa069344-1227-4a18-a111-d639940e9ac8',
          email: 'lengocanhpyne363@gmail.com',
          fullName: 'ABC',
          phoneNumber: '0393173631',
          avatarUrl: null,
          birthDate: '2025-11-22T09:41:22.031Z',
          address: 'abc',
          isActive: true,
          isEmailVerified: true,
          role: 'OWNER',
          createdAt: '2025-11-19T18:36:47.531Z',
          updatedAt: '2025-11-22T09:42:38.128Z',
        },
        createdAt: '2025-11-19T18:36:47.986Z',
        updatedAt: '2025-12-08T18:24:23.851Z',
      },
    },
  })
  @ApiBearerAuth()
  @Patch(':id')
  @Roles(UserRole.OWNER)
  async updateBookStore(
    @Param('id', ParseUUIDPipe) bookStoreId: string,
    @Body() updateBookStoreDto: UpdateBookStoreDto,
    @UserSession() userSession: TUserSession,
  ) {
    return this.bookStoreService.updateBookStore(
      bookStoreId,
      updateBookStoreDto,
      userSession,
    );
  }

  @ApiOperation({
    summary: 'Lấy danh sách cửa hàng dựa trên người dùng hiện tại',
    description:
      'Đường dẫn này dùng để lấy danh sách cửa hàng dựa trên người dùng hiện tại đang thực hiện request, chỉ có OWNER và EMPLOYEE mới có quyền thực hiện hành động này.',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    example: [
      {
        id: '72ba4f79-6642-4da4-990c-bf1180e2ab65',
        code: 'NHASAC-C944',
        name: 'Nhà sách Kim Đồng',
        address: 'Hà Nội',
        phoneNumber: '+84387643543',
        logoUrl: null,
        isActive: true,
        createdAt: '2025-12-08T18:15:39.078Z',
        updatedAt: '2025-12-08T18:15:39.383Z',
      },
      {
        id: '99c31ece-f824-4a34-a965-420c4c86b039',
        code: 'NHASAC-F050',
        name: 'Nhà sách ABC',
        address: 'Phú Yên',
        phoneNumber: '0393877632',
        logoUrl:
          'https://res.cloudinary.com/dct7bksvq/image/upload/v1763647010/tqyvkxk5bndg3rfdfilz.png',
        isActive: true,
        createdAt: '2025-11-19T18:36:47.986Z',
        updatedAt: '2025-12-08T18:24:23.851Z',
      },
    ],
  })
  @Get('my')
  @Roles(UserRole.OWNER, UserRole.EMPLOYEE)
  async getMyBookStores(
    @UserSession() userSession: TUserSession,
    @Query() getMyBookStoresQueryDto: GetMyBookStoresQueryDto,
  ) {
    return this.bookStoreService.getMyBookStores(
      userSession,
      getMyBookStoresQueryDto,
    );
  }

  @ApiOperation({
    summary: 'Đặt lại mật khẩu cho nhân viên',
    description:
      'Đường dẫn này dùng cho chủ nhà sách đặt lại mật khẩu cho nhân viên của họ.',
  })
  @ApiParam({
    name: 'bookStoreId',
    description: 'Id cửa hàng',
    example: '72ba4f79-6642-4da4-990c-bf1180e2ab65',
  })
  @ApiParam({
    name: 'employeeId',
    description: 'Id nhân viên',
    example: '7a3ef648-3a4d-497d-80c0-68c38a148015',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: {
      message: 'Mật khẩu của nhân viên đã được cập nhật thành công.',
    },
  })
  @Patch(':bookStoreId/employees/:employeeId/password/reset')
  @Roles(UserRole.OWNER)
  async updateEmployeePassword(
    @UserSession() userSession: TUserSession,
    @Param('bookStoreId', ParseUUIDPipe) bookStoreId: string,
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
  ) {
    return this.bookStoreService.updateEmployeePassword(
      userSession,
      bookStoreId,
      employeeId,
    );
  }
}
