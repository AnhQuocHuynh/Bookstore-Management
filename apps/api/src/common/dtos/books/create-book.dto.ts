import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  readonly isbn: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly edition?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly language?: string;

  @IsString()
  @IsNotEmpty()
  readonly coverImage: string;

  @IsOptional()
  @IsDate()
  readonly publicationDate?: Date;

  @IsUUID()
  readonly authorId: string;

  @IsUUID()
  readonly publisherId: string;
}
