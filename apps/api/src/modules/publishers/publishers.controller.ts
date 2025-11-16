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
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { PublishersService } from './publishers.service';

@Controller('publishers')
export class PublishersController {
  constructor(private readonly publishersService: PublishersService) {}

  @Get()
  async getPublishers(@BookStoreId() bookStoreId: string) {
    return this.publishersService.getPublishers(bookStoreId);
  }

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

  @Get(':id')
  async getPublisherById(
    @Param('id', ParseUUIDPipe) id: string,
    @BookStoreId() bookStoreId: string,
  ) {
    return this.publishersService.getPublisherById(id, bookStoreId);
  }

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

  @Delete(':id')
  @Roles(UserRole.OWNER)
  async deletePublisherById(
    @Param('id', ParseUUIDPipe) id: string,
    @BookStoreId() bookStoreId: string,
  ) {
    return this.publishersService.deletePublisherById(id, bookStoreId);
  }
}
