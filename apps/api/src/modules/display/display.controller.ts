import { Roles, UserSession } from '@/common/decorators';
import {
  CreateDisplayProductDto,
  CreateDisplayShelfDto,
  GetDisplayProductsQueryDto,
  GetLogsQueryDto,
  MoveDisplayProductDto,
  ReduceDisplayProductQuantityDto,
  UpdateDisplayProductDto,
  UpdateDisplayShelfDto,
} from '@/common/dtos';
import { TUserSession } from '@/common/utils';
import { UserRole } from '@/modules/users/enums';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { DisplayService } from './display.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller('display')
@ApiBearerAuth()
@ApiTags('Hàng trưng bày')
export class DisplayController {
  constructor(private readonly displayService: DisplayService) {}

  @ApiOperation({
    summary: 'Tạo kệ trưng bày',
    description:
      'Đường dẫn này dùng để tạo mới kệ trưng bày, chỉ có NHÂN VIÊN mới có quyền thực hiện hành động này.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Dữ liệu trả về',
    example: {
      id: '51bf1305-6132-420a-96c7-e4e760108347',
      name: 'Kệ 3',
      description: 'Mô tả cho kệ 3',
      createdAt: '2025-12-14T10:09:08.186Z',
      updatedAt: '2025-12-14T10:09:08.186Z',
    },
  })
  @ApiBody({
    type: CreateDisplayShelfDto,
  })
  @Post('shelf')
  @Roles(UserRole.EMPLOYEE)
  async createDisplayShelf(
    @Body() createDisplaySelfDto: CreateDisplayShelfDto,
    @UserSession() userSession: TUserSession,
  ) {
    return this.displayService.createDisplayShelf(
      createDisplaySelfDto,
      userSession,
    );
  }

  @ApiOperation({
    summary: 'Thêm mới sản phẩm vào kệ',
    description:
      'Đường dẫn này dùng để thêm mới sản phẩm vào kệ, chỉ có NHÂN VIÊN mới có quyền thực hiện hành động này.',
  })
  @ApiBody({
    type: CreateDisplayProductDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Dữ liệu trả về',
    example: {
      message: 'Sản phẩm đã được trưng bày trên kệ.',
      data: {
        id: '15c01a7c-1d8a-4aec-94f5-fcedff72e91c',
        quantity: 4,
        displayOrder: null,
        status: 'active',
        product: {
          id: 'ff7a231d-bc3b-4888-be88-b4754395dae3',
          sku: 'STA-39581-434',
          name: 'Product 1',
          description: 'Mô tả abc',
          price: 200000,
          type: 'stationery',
          isActive: true,
          createdAt: '2025-12-07T19:30:39.195Z',
          updatedAt: '2025-12-14T06:30:55.740Z',
          deletedAt: null,
        },
        displayShelf: {
          id: '51bf1305-6132-420a-96c7-e4e760108347',
          name: 'Kệ 3',
          description: 'Mô tả cho kệ 3',
          createdAt: '2025-12-14T10:09:08.186Z',
          updatedAt: '2025-12-14T10:09:08.186Z',
        },
        createdAt: '2025-12-14T10:34:24.886Z',
        updatedAt: '2025-12-14T10:34:24.886Z',
      },
    },
  })
  @Post('product')
  @Roles(UserRole.EMPLOYEE)
  async createDisplayProduct(
    @Body() createDisplayProductDto: CreateDisplayProductDto,
    @UserSession() userSession: TUserSession,
  ) {
    return this.displayService.createDisplayProduct(
      createDisplayProductDto,
      userSession,
    );
  }

  @ApiOperation({
    summary: 'Lấy danh sách các kệ trưng bày',
    description:
      'Đường dẫn này dùng để lấy danh sách các kệ trưng bày, chỉ có CHỦ NHÀ SÁCH VÀ NHÂN VIÊN mới có quyền thực hiện hành động này.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Dữ liệu trả về',
    example: [
      {
        id: '51bf1305-6132-420a-96c7-e4e760108347',
        name: 'Kệ 3',
        description: 'Mô tả cho kệ 3',
        isActive: true,
        createdAt: '2025-12-14T10:09:08.186Z',
        updatedAt: '2025-12-14T10:09:08.186Z',
      },
    ],
  })
  @Get('/shelfs')
  @Roles(UserRole.OWNER, UserRole.EMPLOYEE)
  async getShelfs(@UserSession() userSession: TUserSession) {
    return this.displayService.getShelfs(userSession);
  }

  @ApiOperation({
    summary: 'Lấy thông tin chi tiết một kệ trưng bày',
    description:
      'Đường dẫn này dùng để lấy thông tin chi tiết một kệ trưng bày, chỉ có CHỦ NHÀ SÁCH VÀ NHÂN VIÊN mới có quyền thực hiện hành động này.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Dữ liệu trả về',
    example: {
      id: '51bf1305-6132-420a-96c7-e4e760108347',
      name: 'Kệ 3',
      description: 'Mô tả cho kệ 3',
      isActive: true,
      createdAt: '2025-12-14T10:09:08.186Z',
      updatedAt: '2025-12-14T10:09:08.186Z',
      displayProducts: [
        {
          id: '5ead2f25-7090-4af6-be79-6e7a974fc815',
          quantity: 4,
          displayOrder: null,
          status: 'active',
          product: {
            id: '0564b409-cab9-41f9-8353-1e6a704c3bff',
            sku: 'BOOK-00731-511',
            name: 'Product 2',
            description: 'Mô tả cho Product 2',
            price: 50000,
            type: 'book',
            isActive: true,
            createdAt: '2025-12-14T05:39:58.831Z',
            updatedAt: '2025-12-14T05:39:58.831Z',
            deletedAt: null,
          },
          createdAt: '2025-12-14T10:27:06.319Z',
          updatedAt: '2025-12-14T10:27:06.319Z',
        },
        {
          id: '15c01a7c-1d8a-4aec-94f5-fcedff72e91c',
          quantity: 4,
          displayOrder: null,
          status: 'active',
          product: {
            id: 'ff7a231d-bc3b-4888-be88-b4754395dae3',
            sku: 'STA-39581-434',
            name: 'Product 1',
            description: 'Mô tả abc',
            price: 200000,
            type: 'stationery',
            isActive: true,
            createdAt: '2025-12-07T19:30:39.195Z',
            updatedAt: '2025-12-14T06:30:55.740Z',
            deletedAt: null,
          },
          createdAt: '2025-12-14T10:34:24.886Z',
          updatedAt: '2025-12-14T10:34:24.886Z',
        },
      ],
    },
  })
  @ApiParam({
    name: 'shelfId',
    description: 'Mã ID của kệ.',
    example: '15c01a7c-1d8a-4aec-94f5-fcedff72e91c',
  })
  @Get('/shelfs/:shelfId')
  @Roles(UserRole.OWNER, UserRole.EMPLOYEE)
  async getShelfDetail(
    @UserSession() userSession: TUserSession,
    @Param('shelfId', ParseUUIDPipe) shelfId: string,
  ) {
    return this.displayService.getShelfDetail(userSession, shelfId);
  }

  @ApiOperation({
    summary: 'Cập nhật thông tin kệ trưng bày.',
    description:
      'Đường dẫn này dùng để cập nhật thông tin kệ trưng bày, chỉ có NHÂN VIÊN có quyền thực hiện.',
  })
  @ApiParam({
    name: 'shelfId',
    description: 'Mã ID của kệ.',
    example: '15c01a7c-1d8a-4aec-94f5-fcedff72e91c',
  })
  @ApiBody({
    type: UpdateDisplayShelfDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Dữ liệu trả về',
    example: {
      message: 'Thông tin kệ sách đã được cập nhật.',
      data: {
        id: '51bf1305-6132-420a-96c7-e4e760108347',
        name: 'hello',
        description: 'Mô tả cho kệ 3',
        isActive: true,
        createdAt: '2025-12-14T10:09:08.186Z',
        updatedAt: '2025-12-14T19:34:30.083Z',
        displayProducts: [
          {
            id: '5ead2f25-7090-4af6-be79-6e7a974fc815',
            quantity: 4,
            displayOrder: null,
            status: 'active',
            product: {
              id: '0564b409-cab9-41f9-8353-1e6a704c3bff',
              sku: 'BOOK-00731-511',
              name: 'Product 2',
              description: 'Mô tả cho Product 2',
              price: 50000,
              type: 'book',
              isActive: true,
              createdAt: '2025-12-14T05:39:58.831Z',
              updatedAt: '2025-12-14T05:39:58.831Z',
              deletedAt: null,
            },
            createdAt: '2025-12-14T10:27:06.319Z',
            updatedAt: '2025-12-14T10:27:06.319Z',
          },
          {
            id: '15c01a7c-1d8a-4aec-94f5-fcedff72e91c',
            quantity: 4,
            displayOrder: null,
            status: 'active',
            product: {
              id: 'ff7a231d-bc3b-4888-be88-b4754395dae3',
              sku: 'STA-39581-434',
              name: 'Product 1',
              description: 'Mô tả abc',
              price: 200000,
              type: 'stationery',
              isActive: true,
              createdAt: '2025-12-07T19:30:39.195Z',
              updatedAt: '2025-12-14T06:30:55.740Z',
              deletedAt: null,
            },
            createdAt: '2025-12-14T10:34:24.886Z',
            updatedAt: '2025-12-14T10:34:24.886Z',
          },
        ],
      },
    },
  })
  @Patch('/shelfs/:shelfId')
  @Roles(UserRole.EMPLOYEE)
  async updateShelf(
    @UserSession() userSession: TUserSession,
    @Param('shelfId', ParseUUIDPipe) shelfId: string,
    @Body() updateDisplayShelfDto: UpdateDisplayShelfDto,
  ) {
    return this.displayService.updateShelf(
      userSession,
      shelfId,
      updateDisplayShelfDto,
    );
  }

  @ApiOperation({
    summary: 'Xoá kệ trưng bày',
    description:
      'Đường dẫn này dùng để xoá kệ trưng bày, chỉ có NHÂN VIÊN mới có quyền thực hiện.',
  })
  @ApiParam({
    name: 'shelfId',
    description: 'Mã ID của kệ.',
    example: '15c01a7c-1d8a-4aec-94f5-fcedff72e91c',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: {
      message: 'Kệ trưng bày đã được xoá thành công.',
    },
  })
  @Delete('/shelfs/:shelfId')
  @Roles(UserRole.EMPLOYEE)
  async deleteShelf(
    @UserSession() userSession: TUserSession,
    @Param('shelfId', ParseUUIDPipe) shelfId: string,
  ) {
    return this.displayService.deleteShelf(userSession, shelfId);
  }

  @ApiOperation({
    summary: 'Lấy danh sách logs của trưng bày sản phẩm.',
    description: 'Đường dẫn này dùng để lấy ds logs của trưng bày sản phẩm.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: [
      {
        id: '777a10c4-a95e-4669-8470-c0ab965b35de',
        displayProduct: null,
        shelf: {
          id: '51bf1305-6132-420a-96c7-e4e760108347',
          name: 'hello',
          description: 'Mô tả cho kệ 3',
          isActive: true,
          createdAt: '2025-12-14T10:09:08.186Z',
          updatedAt: '2025-12-14T19:36:04.760Z',
        },
        quantity: null,
        employee: {
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
        action: 'remove',
        note: 'Xoá bỏ kệ sách',
        createdAt: '2025-12-14T19:36:05.260Z',
        updatedAt: '2025-12-14T19:36:05.260Z',
      },
      {
        id: 'e3fbf603-e257-4463-99c0-b02eec4e9256',
        displayProduct: null,
        shelf: {
          id: '51bf1305-6132-420a-96c7-e4e760108347',
          name: 'hello',
          description: 'Mô tả cho kệ 3',
          isActive: true,
          createdAt: '2025-12-14T10:09:08.186Z',
          updatedAt: '2025-12-14T19:36:04.760Z',
        },
        quantity: null,
        employee: {
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
        action: 'adjust',
        note: 'Cập nhật thông tin kệ sách',
        createdAt: '2025-12-14T19:35:03.414Z',
        updatedAt: '2025-12-14T19:35:03.414Z',
      },
      {
        id: '3f253b1f-c9e2-4d22-99fc-abf528213015',
        displayProduct: null,
        shelf: {
          id: '51bf1305-6132-420a-96c7-e4e760108347',
          name: 'hello',
          description: 'Mô tả cho kệ 3',
          isActive: true,
          createdAt: '2025-12-14T10:09:08.186Z',
          updatedAt: '2025-12-14T19:36:04.760Z',
        },
        quantity: null,
        employee: {
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
        action: 'adjust',
        note: 'Cập nhật thông tin kệ sách',
        createdAt: '2025-12-14T19:34:30.532Z',
        updatedAt: '2025-12-14T19:34:30.532Z',
      },
      {
        id: 'f80691a2-c637-4e3f-a463-8c7b2343cd63',
        displayProduct: null,
        shelf: {
          id: '51bf1305-6132-420a-96c7-e4e760108347',
          name: 'hello',
          description: 'Mô tả cho kệ 3',
          isActive: true,
          createdAt: '2025-12-14T10:09:08.186Z',
          updatedAt: '2025-12-14T19:36:04.760Z',
        },
        quantity: null,
        employee: {
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
        action: 'adjust',
        note: 'Cập nhật thông tin kệ sách',
        createdAt: '2025-12-14T19:34:10.168Z',
        updatedAt: '2025-12-14T19:34:10.168Z',
      },
      {
        id: '8c6471f4-f6f6-4294-9673-71635cee6b77',
        displayProduct: {
          id: '15c01a7c-1d8a-4aec-94f5-fcedff72e91c',
          quantity: 4,
          displayOrder: null,
          status: 'active',
          product: {
            id: 'ff7a231d-bc3b-4888-be88-b4754395dae3',
            sku: 'STA-39581-434',
            name: 'Product 1',
            description: 'Mô tả abc',
            price: 200000,
            type: 'stationery',
            isActive: true,
            createdAt: '2025-12-07T19:30:39.195Z',
            updatedAt: '2025-12-14T06:30:55.740Z',
            deletedAt: null,
          },
          createdAt: '2025-12-14T10:34:24.886Z',
          updatedAt: '2025-12-14T10:34:24.886Z',
        },
        shelf: {
          id: '51bf1305-6132-420a-96c7-e4e760108347',
          name: 'hello',
          description: 'Mô tả cho kệ 3',
          isActive: true,
          createdAt: '2025-12-14T10:09:08.186Z',
          updatedAt: '2025-12-14T19:36:04.760Z',
        },
        quantity: 4,
        employee: {
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
        action: 'add',
        note: 'Thêm mới sản phẩm vào kệ trưng bày',
        createdAt: '2025-12-14T10:34:25.451Z',
        updatedAt: '2025-12-14T10:34:25.451Z',
      },
      {
        id: '14030910-7c40-418b-9f24-819cb71873d7',
        displayProduct: {
          id: '5ead2f25-7090-4af6-be79-6e7a974fc815',
          quantity: 4,
          displayOrder: null,
          status: 'active',
          product: {
            id: '0564b409-cab9-41f9-8353-1e6a704c3bff',
            sku: 'BOOK-00731-511',
            name: 'Product 2',
            description: 'Mô tả cho Product 2',
            price: 50000,
            type: 'book',
            isActive: true,
            createdAt: '2025-12-14T05:39:58.831Z',
            updatedAt: '2025-12-14T05:39:58.831Z',
            deletedAt: null,
          },
          createdAt: '2025-12-14T10:27:06.319Z',
          updatedAt: '2025-12-14T10:27:06.319Z',
        },
        shelf: {
          id: '51bf1305-6132-420a-96c7-e4e760108347',
          name: 'hello',
          description: 'Mô tả cho kệ 3',
          isActive: true,
          createdAt: '2025-12-14T10:09:08.186Z',
          updatedAt: '2025-12-14T19:36:04.760Z',
        },
        quantity: 4,
        employee: {
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
        action: 'add',
        note: 'Thêm mới sản phẩm vào kệ trưng bày',
        createdAt: '2025-12-14T10:27:07.075Z',
        updatedAt: '2025-12-14T10:27:07.075Z',
      },
    ],
  })
  @Get('/logs')
  @Roles(UserRole.OWNER, UserRole.EMPLOYEE)
  async getLogs(
    @UserSession() userSession: TUserSession,
    @Query() getLogsQueryDto: GetLogsQueryDto,
  ) {
    return this.displayService.getLogs(userSession, getLogsQueryDto);
  }

  @ApiOperation({
    summary: 'Lấy chi tiết log',
    description: 'Đường dẫn này dùng để lấy chi tiết log.',
  })
  @ApiParam({
    name: 'logId',
    description: 'Mã ID của log',
    example: 'id-1',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: {
      id: '14030910-7c40-418b-9f24-819cb71873d7',
      displayProduct: {
        id: '5ead2f25-7090-4af6-be79-6e7a974fc815',
        quantity: 4,
        displayOrder: null,
        status: 'active',
        product: {
          id: '0564b409-cab9-41f9-8353-1e6a704c3bff',
          sku: 'BOOK-00731-511',
          name: 'Product 2',
          description: 'Mô tả cho Product 2',
          price: 50000,
          type: 'book',
          isActive: true,
          createdAt: '2025-12-14T05:39:58.831Z',
          updatedAt: '2025-12-14T05:39:58.831Z',
          deletedAt: null,
        },
        createdAt: '2025-12-14T10:27:06.319Z',
        updatedAt: '2025-12-14T10:27:06.319Z',
      },
      shelf: {
        id: '51bf1305-6132-420a-96c7-e4e760108347',
        name: 'hello',
        description: 'Mô tả cho kệ 3',
        isActive: true,
        createdAt: '2025-12-14T10:09:08.186Z',
        updatedAt: '2025-12-14T19:36:04.760Z',
      },
      quantity: 4,
      employee: {
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
      action: 'add',
      note: 'Thêm mới sản phẩm vào kệ trưng bày',
      createdAt: '2025-12-14T10:27:07.075Z',
      updatedAt: '2025-12-14T10:27:07.075Z',
    },
  })
  @Get('/logs/:logId')
  @Roles(UserRole.OWNER, UserRole.EMPLOYEE)
  async getLogDetail(
    @UserSession() userSession: TUserSession,
    @Param('logId', ParseUUIDPipe) logId: string,
  ) {
    return this.displayService.getLogDetail(userSession, logId);
  }

  @ApiOperation({
    summary: 'Lấy danh sách sản phẩm trưng bày',
    description: 'Đường dẫn này dùng để lấy danh sách sản phẩm trưng bày.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: [
      {
        id: '15c01a7c-1d8a-4aec-94f5-fcedff72e91c',
        quantity: 4,
        displayOrder: null,
        status: 'active',
        product: {
          id: 'ff7a231d-bc3b-4888-be88-b4754395dae3',
          sku: 'STA-39581-434',
          name: 'Product 1',
          description: 'Mô tả abc',
          price: 200000,
          type: 'stationery',
          isActive: true,
          createdAt: '2025-12-07T19:30:39.195Z',
          updatedAt: '2025-12-14T06:30:55.740Z',
          book: null,
          deletedAt: null,
        },
        displayShelf: {
          id: '51bf1305-6132-420a-96c7-e4e760108347',
          name: 'hello',
          description: 'Mô tả cho kệ 3',
          isActive: true,
          createdAt: '2025-12-14T10:09:08.186Z',
          updatedAt: '2025-12-14T19:36:04.760Z',
        },
        createdAt: '2025-12-14T10:34:24.886Z',
        updatedAt: '2025-12-14T10:34:24.886Z',
      },
      {
        id: '5ead2f25-7090-4af6-be79-6e7a974fc815',
        quantity: 4,
        displayOrder: null,
        status: 'active',
        product: {
          id: '0564b409-cab9-41f9-8353-1e6a704c3bff',
          sku: 'BOOK-00731-511',
          name: 'Product 2',
          description: 'Mô tả cho Product 2',
          price: 50000,
          type: 'book',
          isActive: true,
          createdAt: '2025-12-14T05:39:58.831Z',
          updatedAt: '2025-12-14T05:39:58.831Z',
          book: {
            id: 'f07a4b2f-5794-4c5e-9c43-062b5366bada',
            isbn: '9780134494166',
            publicationDate: null,
            edition: 'Tái bản lần 1',
            language: 'Tiếng Việt',
            coverImage: 'https://cdn.example.com/books/clean-architecture.jpg',
            status: 'available',
            createdAt: '2025-12-14T05:39:58.831Z',
            updatedAt: '2025-12-14T05:39:58.831Z',
          },
          deletedAt: null,
        },
        displayShelf: {
          id: '51bf1305-6132-420a-96c7-e4e760108347',
          name: 'hello',
          description: 'Mô tả cho kệ 3',
          isActive: true,
          createdAt: '2025-12-14T10:09:08.186Z',
          updatedAt: '2025-12-14T19:36:04.760Z',
        },
        createdAt: '2025-12-14T10:27:06.319Z',
        updatedAt: '2025-12-14T10:27:06.319Z',
      },
    ],
  })
  @Get('/products')
  @Roles(UserRole.OWNER, UserRole.EMPLOYEE)
  async getDisplayProducts(
    @UserSession() userSession: TUserSession,
    @Query()
    getDisplayProductsQueryDto: GetDisplayProductsQueryDto,
  ) {
    return this.displayService.getDisplayProducts(
      userSession,
      getDisplayProductsQueryDto,
    );
  }

  @ApiOperation({
    summary: 'Lấy chi tiết trưng bày sản phẩm',
    description: 'Đường dẫn này dùng để lấy chi tiết trưng bày sản phẩm.',
  })
  @ApiParam({
    name: 'displayProductId',
    description: 'Mã ID của trưng bày',
    example: 'id-1',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: {
      id: '5ead2f25-7090-4af6-be79-6e7a974fc815',
      quantity: 4,
      displayOrder: null,
      status: 'active',
      product: {
        id: '0564b409-cab9-41f9-8353-1e6a704c3bff',
        sku: 'BOOK-00731-511',
        name: 'Product 2',
        description: 'Mô tả cho Product 2',
        price: 50000,
        type: 'book',
        isActive: true,
        createdAt: '2025-12-14T05:39:58.831Z',
        updatedAt: '2025-12-14T05:39:58.831Z',
        book: {
          id: 'f07a4b2f-5794-4c5e-9c43-062b5366bada',
          isbn: '9780134494166',
          publicationDate: null,
          edition: 'Tái bản lần 1',
          language: 'Tiếng Việt',
          coverImage: 'https://cdn.example.com/books/clean-architecture.jpg',
          status: 'available',
          createdAt: '2025-12-14T05:39:58.831Z',
          updatedAt: '2025-12-14T05:39:58.831Z',
        },
        deletedAt: null,
      },
      displayShelf: {
        id: '51bf1305-6132-420a-96c7-e4e760108347',
        name: 'hello',
        description: 'Mô tả cho kệ 3',
        isActive: true,
        createdAt: '2025-12-14T10:09:08.186Z',
        updatedAt: '2025-12-14T19:36:04.760Z',
      },
      createdAt: '2025-12-14T10:27:06.319Z',
      updatedAt: '2025-12-14T10:27:06.319Z',
    },
  })
  @Get('/products/:displayProductId')
  @Roles(UserRole.OWNER, UserRole.EMPLOYEE)
  async getDisplayProductDetail(
    @Param('displayProductId', ParseUUIDPipe) displayProductId: string,
    @UserSession() userSession: TUserSession,
  ) {
    return this.displayService.getDisplayProductDetail(
      userSession,
      displayProductId,
    );
  }

  @ApiOperation({
    summary: 'Cập nhật trưng bày sản phẩm',
    description:
      'Đường dẫn này dùng để cập nhật trưng bày sản phẩm, chỉ có NHÂN VIÊN nhà sách mới có quyền thực hiện.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: {
      message: 'Cập nhật thông tin trưng bày thành công.',
      data: {
        id: '5ead2f25-7090-4af6-be79-6e7a974fc815',
        quantity: 2,
        displayOrder: null,
        status: 'active',
        product: {
          id: '0564b409-cab9-41f9-8353-1e6a704c3bff',
          sku: 'BOOK-00731-511',
          name: 'Product 2',
          description: 'Mô tả cho Product 2',
          price: 50000,
          type: 'book',
          isActive: true,
          createdAt: '2025-12-14T05:39:58.831Z',
          updatedAt: '2025-12-14T05:39:58.831Z',
          inventory: {
            id: '9492fc07-410d-4073-87ac-41331c5fdac9',
            stockQuantity: 20,
            displayQuantity: 2,
            availableQuantity: 18,
            costPrice: 40000,
            createdAt: '2025-12-14T05:39:58.831Z',
            updatedAt: '2025-12-14T20:45:11.315Z',
          },
          deletedAt: null,
        },
        displayShelf: {
          id: '51bf1305-6132-420a-96c7-e4e760108347',
          name: 'hello',
          description: 'Mô tả cho kệ 3',
          isActive: true,
          createdAt: '2025-12-14T10:09:08.186Z',
          updatedAt: '2025-12-14T19:36:04.760Z',
        },
        createdAt: '2025-12-14T10:27:06.319Z',
        updatedAt: '2025-12-14T20:45:11.948Z',
      },
    },
  })
  @ApiParam({
    name: 'displayProductId',
    example: 'id-1',
    description: 'Mã ID của trưng bày.',
  })
  @ApiBody({
    type: UpdateDisplayProductDto,
  })
  @Patch('/products/:displayProductId')
  @Roles(UserRole.EMPLOYEE)
  async updateDisplayProduct(
    @UserSession() userSession: TUserSession,
    @Param('displayProductId', ParseUUIDPipe) displayProductId: string,
    @Body() updateDisplayProductDto: UpdateDisplayProductDto,
  ) {
    return this.displayService.updateDisplayProduct(
      userSession,
      displayProductId,
      updateDisplayProductDto,
    );
  }

  @ApiOperation({
    summary: 'Xoá trưng bày sản phẩm',
    description: 'Đường dẫn này dùng để xoá sản phẩm trưng bày.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: {
      message: `Sản phẩm trên kệ đã được xoá thành công và trả về kho.`,
    },
  })
  @ApiParam({
    name: 'displayProductId',
    description: 'Mã ID của trưng bày sản phẩm',
    example: 'id-1',
  })
  @Delete('/products/:displayProductId')
  @Roles(UserRole.EMPLOYEE)
  async deleteDisplayProductFromShelf(
    @UserSession() userSession: TUserSession,
    @Param('displayProductId', ParseUUIDPipe) displayProductId: string,
  ) {
    return this.displayService.deleteDisplayProductFromShelf(
      userSession,
      displayProductId,
    );
  }

  @ApiOperation({
    summary: 'Giảm số lượng sản phẩm trưng bày',
    description: 'Đường dẫn này dùng để giảm số lượng sản phẩm trưng bày.',
  })
  @ApiParam({
    name: 'displayProductId',
    description: 'Id của sản phẩm trưng bày',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: {
      message: `Đã trả thành công 10 bản về kho.`,
    },
  })
  @ApiBody({
    type: ReduceDisplayProductQuantityDto,
  })
  @Patch('/products/:displayProductId/reduce')
  @Roles(UserRole.EMPLOYEE)
  async reduceDisplayProductQuantity(
    @UserSession() userSession: TUserSession,
    @Param('displayProductId', ParseUUIDPipe) displayProductId: string,
    @Body() reduceDisplayProductQuantityDto: ReduceDisplayProductQuantityDto,
  ) {
    return this.displayService.reduceDisplayProductQuantity(
      userSession,
      displayProductId,
      reduceDisplayProductQuantityDto,
    );
  }

  @ApiOperation({
    summary: 'Di chuyển sản phẩm trưng bày sang kệ khác',
    description:
      'Đường dẫn này dùng để di chuyển sản phẩm trưng bày sang kệ khác.',
  })
  @ApiParam({
    name: 'displayProductId',
    description: 'Mã ID của sản phẩm trưng bày',
    example: 'id-1',
  })
  @ApiBody({
    type: MoveDisplayProductDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    example: {
      message: 'Đã di chuyển thành công 1 bản.',
      data: {
        id: '12fc7b2b-f5e1-404f-9f5c-e94c4fdf7345',
        quantity: 1,
        displayOrder: null,
        status: 'active',
        product: {
          id: '0564b409-cab9-41f9-8353-1e6a704c3bff',
          sku: 'BOOK-00731-511',
          name: 'Product 2',
          description: 'Mô tả cho Product 2',
          price: 50000,
          type: 'book',
          isActive: true,
          createdAt: '2025-12-14T05:39:58.831Z',
          updatedAt: '2025-12-14T05:39:58.831Z',
          book: {
            id: 'f07a4b2f-5794-4c5e-9c43-062b5366bada',
            isbn: '9780134494166',
            publicationDate: null,
            edition: 'Tái bản lần 1',
            language: 'Tiếng Việt',
            coverImage: 'https://cdn.example.com/books/clean-architecture.jpg',
            status: 'available',
            createdAt: '2025-12-14T05:39:58.831Z',
            updatedAt: '2025-12-14T05:39:58.831Z',
          },
          deletedAt: null,
        },
        displayShelf: {
          id: 'df96e8e4-9d10-413c-8de0-de311b5e3bb9',
          name: 'Kệ 4',
          description: 'Mô tả cho kệ 4',
          isActive: true,
          createdAt: '2025-12-14T21:01:39.822Z',
          updatedAt: '2025-12-14T21:01:39.822Z',
        },
        createdAt: '2025-12-14T21:02:11.533Z',
        updatedAt: '2025-12-14T21:02:11.533Z',
      },
    },
  })
  @Post('/products/:displayProductId/move')
  @Roles(UserRole.EMPLOYEE)
  async moveDisplayProduct(
    @UserSession() userSession: TUserSession,
    @Param('displayProductId', ParseUUIDPipe) displayProductId: string,
    @Body() moveDisplayProductDto: MoveDisplayProductDto,
  ) {
    return this.displayService.moveDisplayProduct(
      userSession,
      displayProductId,
      moveDisplayProductDto,
    );
  }
}
