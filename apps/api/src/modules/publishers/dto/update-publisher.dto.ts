import { CreatePublisherDto } from '@/modules/publishers/dto/create-publisher.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdatePublisherDto extends PartialType(CreatePublisherDto) {}
