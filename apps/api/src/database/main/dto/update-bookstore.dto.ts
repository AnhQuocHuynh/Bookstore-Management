import { CreateBookStoreDto } from '@/database/main/dto/create-bookstore.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateBookStoreDto extends PartialType(CreateBookStoreDto) {}
