import {
  ArrayNotEmpty,
  IsArray,
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

  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly description?: string;

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

  @IsNumber()
  @IsPositive()
  readonly price: number;

  @IsOptional()
  @IsDate()
  readonly publicationDate?: Date;

  @IsUUID()
  readonly authorId: string;

  @IsUUID()
  readonly publisherId: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', {
    each: true,
  })
  readonly categoryIds: string[];
}
