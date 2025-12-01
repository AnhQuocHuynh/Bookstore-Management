import {
  Body,
  Controller,
  Delete,
  Get,
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

@Controller('categories')
@Roles(UserRole.OWNER)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @Roles(UserRole.OWNER, UserRole.EMPLOYEE, UserRole.CUSTOMER)
  async getCategories(@UserSession() userSession: TUserSession) {
    return this.categoriesService.getCategories(userSession);
  }

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

  @Delete(':id')
  async deleteCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @UserSession() userSession: TUserSession,
  ) {
    return this.categoriesService.deleteCategory(userSession, id);
  }
}
