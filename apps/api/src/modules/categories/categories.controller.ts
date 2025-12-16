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
import { CategoriesService } from './categories.service';
import { Roles, UserSession } from '@/common/decorators';
import { UserRole } from '@/modules/users/enums';
import {
  CreateCategoryDto,
  GetCategoriesQueryDto,
  UpdateCategoryDto,
} from '@/common/dtos';
import { TUserSession } from '@/common/utils';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller('categories')
@ApiTags('CategoriesController')
@ApiBearerAuth()
@Roles(UserRole.OWNER)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({
    summary: 'Tạo mới danh mục',
    description:
      'Đường dẫn này dùng để tạo mới danh mục sản phẩm, chỉ có OWNER mới có quyền thực hiện hành động này.',
  })
  @ApiBody({
    type: CreateCategoryDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    example: {
      message: 'New category created successfully.',
      data: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        name: 'Sách văn học',
        slug: 'sach-van-hoc',
        description: 'Danh mục sách văn học',
        taxRate: 10,
        status: 'ACTIVE',
        parent: null,
        createdAt: '2025-12-08T10:00:00.000Z',
        updatedAt: '2025-12-08T10:00:00.000Z',
      },
    },
  })
  @Post()
  async createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
    @UserSession() userSession: TUserSession,
  ) {
    return this.categoriesService.createNewCategory(
      createCategoryDto,
      userSession,
    );
  }

  @ApiOperation({
    summary: 'Lấy danh sách danh mục',
    description:
      'Đường dẫn này dùng để lấy danh sách danh mục sản phẩm, chỉ có OWNER mới có quyền thực hiện hành động này.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: {
      data: [
        {
          id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          name: 'Sách văn học',
          slug: 'sach-van-hoc',
          description: 'Danh mục sách văn học',
          taxRate: 10,
          status: 'ACTIVE',
          parent: null,
          createdAt: '2025-12-08T10:00:00.000Z',
          updatedAt: '2025-12-08T10:00:00.000Z',
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
    },
  })
  @Get()
  async getCategories(
    @UserSession() userSession: TUserSession,
    @Query() getCategoriesQueryDto: GetCategoriesQueryDto,
  ) {
    return this.categoriesService.getCategories(
      userSession,
      getCategoriesQueryDto,
    );
  }

  @ApiOperation({
    summary: 'Lấy thông tin chi tiết danh mục',
    description:
      'Đường dẫn này dùng để lấy thông tin chi tiết của một danh mục sản phẩm.',
  })
  @ApiParam({
    name: 'id',
    description: 'Id của danh mục',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      name: 'Sách văn học',
      slug: 'sach-van-hoc',
      description: 'Danh mục sách văn học',
      taxRate: 10,
      status: 'ACTIVE',
      parent: null,
      children: [],
      createdAt: '2025-12-08T10:00:00.000Z',
      updatedAt: '2025-12-08T10:00:00.000Z',
    },
  })
  @Get(':id')
  @Roles(UserRole.OWNER, UserRole.EMPLOYEE, UserRole.CUSTOMER)
  async getCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @UserSession() userSession: TUserSession,
  ) {
    return this.categoriesService.getCategoryById(userSession, id);
  }

  @ApiOperation({
    summary: 'Cập nhật thông tin danh mục',
    description:
      'Đường dẫn này dùng để cập nhật thông tin danh mục sản phẩm, chỉ có OWNER mới có quyền thực hiện hành động này.',
  })
  @ApiParam({
    name: 'id',
    description: 'Id của danh mục',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiBody({
    type: UpdateCategoryDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: {
      message: 'Category updated successfully.',
      data: {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        name: 'Sách văn học Việt Nam',
        slug: 'sach-van-hoc-viet-nam',
        description: 'Danh mục sách văn học Việt Nam',
        taxRate: 10,
        status: 'ACTIVE',
        parent: null,
        children: [],
        createdAt: '2025-12-08T10:00:00.000Z',
        updatedAt: '2025-12-08T11:00:00.000Z',
      },
    },
  })
  @Patch(':id')
  async updateCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @UserSession() userSession: TUserSession,
  ) {
    return this.categoriesService.updateCategory(
      userSession,
      id,
      updateCategoryDto,
    );
  }

  @ApiOperation({
    summary: 'Xóa danh mục',
    description:
      'Đường dẫn này dùng để xóa danh mục sản phẩm (đánh dấu không hoạt động), chỉ có OWNER mới có quyền thực hiện hành động này.',
  })
  @ApiParam({
    name: 'id',
    description: 'Id của danh mục',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    example: {
      message: 'Category deleted successfully.',
    },
  })
  @Delete(':id')
  async deleteCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @UserSession() userSession: TUserSession,
  ) {
    return this.categoriesService.deleteCategory(userSession, id);
  }
}
