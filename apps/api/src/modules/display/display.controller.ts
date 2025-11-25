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
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { DisplayService } from './display.service';

@Controller('display')
export class DisplayController {
  constructor(private readonly displayService: DisplayService) {}

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

  @Get('/shelfs')
  @Roles(UserRole.OWNER, UserRole.EMPLOYEE)
  async getShelfs(@UserSession() userSession: TUserSession) {
    return this.displayService.getShelfs(userSession);
  }

  @Get('/shelf/:shelfId')
  @Roles(UserRole.OWNER, UserRole.EMPLOYEE)
  async getShelfDetail(
    @UserSession() userSession: TUserSession,
    @Param('shelfId', ParseUUIDPipe) shelfId: string,
  ) {
    return this.displayService.getShelfDetail(userSession, shelfId);
  }

  @Patch('/shelf/:shelfId')
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

  @Delete('/shelf/:shelfId')
  @Roles(UserRole.EMPLOYEE)
  async deleteShelf(
    @UserSession() userSession: TUserSession,
    @Param('shelfId', ParseUUIDPipe) shelfId: string,
  ) {
    return this.displayService.deleteShelf(userSession, shelfId);
  }

  @Get('/logs')
  @Roles(UserRole.OWNER, UserRole.EMPLOYEE)
  async getLogs(
    @UserSession() userSession: TUserSession,
    @Query() getLogsQueryDto: GetLogsQueryDto,
  ) {
    return this.displayService.getLogs(userSession, getLogsQueryDto);
  }

  @Get('/logs/:logId')
  @Roles(UserRole.OWNER, UserRole.EMPLOYEE)
  async getLogDetail(
    @UserSession() userSession: TUserSession,
    @Param('logId', ParseUUIDPipe) logId: string,
  ) {
    return this.displayService.getLogDetail(userSession, logId);
  }

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

  @Patch('/products/:displayProductId')
  @Roles(UserRole.EMPLOYEE, UserRole.OWNER)
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
