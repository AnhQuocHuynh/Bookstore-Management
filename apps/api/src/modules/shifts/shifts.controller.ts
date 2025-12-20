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
import { ShiftService } from './shifts.service';
import { BookStoreId, Roles } from '@/common/decorators';
import { UserRole } from '@/modules/users/enums';
import { CreateShiftDto, UpdateShiftDto } from '@/common/dtos';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller('shifts')
@ApiTags('Ca làm')
@ApiBearerAuth()
export class ShiftController {
  constructor(private readonly shiftService: ShiftService) {}

  @ApiOperation({
    summary: 'Tạo mới ca làm',
    description: 'Đường dẫn này dùng để tạo mới ca làm.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    example: {
      message: 'Đã tạo mới ca làm thành công.',
      data: {
        id: 'bbb39e85-f93d-48fd-a33c-0b902161e0d6',
        name: 'Ca sáng',
        startTime: '07:00',
        endTime: '10:00',
        description: 'Mô tả ca làm việc buổi sáng',
        createdAt: '2025-12-08T23:54:44.601Z',
        updatedAt: '2025-12-08T23:54:44.601Z',
      },
    },
  })
  @ApiBody({
    type: CreateShiftDto,
  })
  @Post()
  @Roles(UserRole.OWNER)
  async createShift(
    @Body() createShiftDto: CreateShiftDto,
    @BookStoreId() bookStoreId: string,
  ) {
    return this.shiftService.createShift(createShiftDto, bookStoreId);
  }

  @ApiOperation({
    summary: 'Lấy danh sách ca làm',
    description: 'Đường dẫn này dùng để lấy danh sách các ca làm việc.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: [
      {
        id: 'bbb39e85-f93d-48fd-a33c-0b902161e0d6',
        name: 'Ca sáng',
        startTime: '07:00',
        endTime: '10:00',
        description: 'Mô tả ca làm việc buổi sáng',
        createdAt: '2025-12-08T23:54:44.601Z',
        updatedAt: '2025-12-08T23:54:44.601Z',
      },
    ],
  })
  @Get()
  @Roles(UserRole.OWNER, UserRole.EMPLOYEE)
  async getShifts(@BookStoreId() bookStoreId: string) {
    return this.shiftService.getShifts(bookStoreId);
  }

  @ApiOperation({
    summary: 'Cập nhật ca làm',
    description: 'Đường dẫn này dùng để cập nhật ca làm.',
  })
  @ApiBody({
    type: UpdateShiftDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: {
      id: 'bbb39e85-f93d-48fd-a33c-0b902161e0d6',
      name: 'Ca sáng',
      startTime: '07:00',
      endTime: '10:00',
      description: 'Mô tả cho ca sáng',
      createdAt: '2025-12-08T23:54:44.601Z',
      updatedAt: '2025-12-09T00:25:54.478Z',
    },
  })
  @ApiParam({
    name: 'id',
    description: 'Id của ca làm.',
    example: 'bbb39e85-f93d-48fd-a33c-0b902161e0d6',
  })
  @Roles(UserRole.OWNER)
  @Patch(':id')
  async updateShift(
    @BookStoreId() bookStoreId: string,
    @Body() updateShiftDto: UpdateShiftDto,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.shiftService.updateShift(bookStoreId, updateShiftDto, id);
  }

  @ApiOperation({
    summary: 'Xoá ca làm',
    description: 'Đường dẫn này dùng để xoá ca làm.',
  })
  @ApiParam({
    name: 'id',
    description: 'Id của ca làm',
    example: 'bbb39e85-f93d-48fd-a33c-0b902161e0d6',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: {
      message: 'Ca làm đã được xoá thành công.',
    },
  })
  @Roles(UserRole.OWNER)
  @Delete(':id')
  async deleteShift(
    @Param('id', ParseUUIDPipe) id: string,
    @BookStoreId() bookStoreId: string,
  ) {
    return this.shiftService.deleteShift(id, bookStoreId);
  }
}
