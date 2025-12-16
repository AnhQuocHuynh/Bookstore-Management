import { BookStoreId, Roles } from '@/common/decorators';
import {
  CreatePublisherDto,
  UpdatePublisherDto,
} from '@/modules/publishers/dto';
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
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PublishersService } from './publishers.service';

@Controller('publishers')
@ApiTags('PublishersController')
@ApiBearerAuth()
export class PublishersController {
  constructor(private readonly publishersService: PublishersService) {}

  @ApiOperation({
    summary: 'Lấy danh sách nhà xuất bản',
    description: 'Đường dẫn này dùng để lấy danh sách nhà xuất bản.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: [
      {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        name: 'Nhà xuất bản Kim Đồng',
        email: 'publisher@example.com',
        phone: '0393877632',
        address: 'Hồ Chí Minh',
        website: 'https://nxbkimdong.com.vn',
        description: 'Nhà xuất bản sách thiếu nhi',
        createdAt: '2025-12-08T10:00:00.000Z',
        updatedAt: '2025-12-08T10:00:00.000Z',
      },
    ],
  })
  @Get()
  async getPublishers(@BookStoreId() bookStoreId: string) {
    return this.publishersService.getPublishers(bookStoreId);
  }

  @ApiOperation({
    summary: 'Tạo mới nhà xuất bản',
    description:
      'Đường dẫn này dùng để tạo mới nhà xuất bản, chỉ có OWNER mới có quyền thực hiện hành động này.',
  })
  @ApiBody({
    type: CreatePublisherDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    example: {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      name: 'Nhà xuất bản Kim Đồng',
      email: 'publisher@example.com',
      phone: '0393877632',
      address: 'Hồ Chí Minh',
      website: 'https://nxbkimdong.com.vn',
      description: 'Nhà xuất bản sách thiếu nhi',
      createdAt: '2025-12-08T10:00:00.000Z',
      updatedAt: '2025-12-08T10:00:00.000Z',
    },
  })
  @Post()
  @Roles(UserRole.OWNER)
  async createPublisher(
    @Body() createPublisherDto: CreatePublisherDto,
    @BookStoreId() bookStoreId: string,
  ) {
    return this.publishersService.createPublisher(
      createPublisherDto,
      bookStoreId,
    );
  }

  @ApiOperation({
    summary: 'Lấy thông tin chi tiết nhà xuất bản',
    description: 'Đường dẫn này dùng để lấy thông tin chi tiết của một nhà xuất bản.',
  })
  @ApiParam({
    name: 'id',
    description: 'Id của nhà xuất bản',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      name: 'Nhà xuất bản Kim Đồng',
      email: 'publisher@example.com',
      phone: '0393877632',
      address: 'Hồ Chí Minh',
      website: 'https://nxbkimdong.com.vn',
      description: 'Nhà xuất bản sách thiếu nhi',
      createdAt: '2025-12-08T10:00:00.000Z',
      updatedAt: '2025-12-08T10:00:00.000Z',
    },
  })
  @Get(':id')
  async getPublisherById(
    @Param('id', ParseUUIDPipe) id: string,
    @BookStoreId() bookStoreId: string,
  ) {
    return this.publishersService.getPublisherById(id, bookStoreId);
  }

  @ApiOperation({
    summary: 'Cập nhật thông tin nhà xuất bản',
    description:
      'Đường dẫn này dùng để cập nhật thông tin nhà xuất bản, chỉ có OWNER mới có quyền thực hiện hành động này.',
  })
  @ApiParam({
    name: 'id',
    description: 'Id của nhà xuất bản',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiBody({
    type: UpdatePublisherDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      name: 'Nhà xuất bản Trẻ',
      email: 'publisher@example.com',
      phone: '0393877632',
      address: 'Hà Nội',
      website: 'https://nxbtre.com.vn',
      description: 'Nhà xuất bản sách văn học',
      createdAt: '2025-12-08T10:00:00.000Z',
      updatedAt: '2025-12-08T11:00:00.000Z',
    },
  })
  @Patch(':id')
  @Roles(UserRole.OWNER)
  async updatePublisherById(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePublisherDto: UpdatePublisherDto,
    @BookStoreId() bookStoreId: string,
  ) {
    return this.publishersService.updatePublisherById(
      id,
      updatePublisherDto,
      bookStoreId,
    );
  }

  @ApiOperation({
    summary: 'Xóa nhà xuất bản',
    description:
      'Đường dẫn này dùng để xóa nhà xuất bản, chỉ có OWNER mới có quyền thực hiện hành động này.',
  })
  @ApiParam({
    name: 'id',
    description: 'Id của nhà xuất bản',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: [
      {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        name: 'Nhà xuất bản Kim Đồng',
        email: 'publisher@example.com',
        phone: '0393877632',
        address: 'Hồ Chí Minh',
        website: 'https://nxbkimdong.com.vn',
        description: 'Nhà xuất bản sách thiếu nhi',
        createdAt: '2025-12-08T10:00:00.000Z',
        updatedAt: '2025-12-08T10:00:00.000Z',
      },
    ],
  })
  @Delete(':id')
  @Roles(UserRole.OWNER)
  async deletePublisherById(
    @Param('id', ParseUUIDPipe) id: string,
    @BookStoreId() bookStoreId: string,
  ) {
    return this.publishersService.deletePublisherById(id, bookStoreId);
  }
}
