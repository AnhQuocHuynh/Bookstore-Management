import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDatabaseConnectionDto {
  @ApiProperty({ description: 'Địa chỉ host của cơ sở dữ liệu' })
  @IsString({ message: 'Host phải là một chuỗi' })
  @IsNotEmpty({ message: 'Host không được để trống' })
  readonly host: string;

  @ApiProperty({ description: 'Cổng kết nối đến cơ sở dữ liệu', example: 5432 })
  @IsNumber({}, { message: 'Port phải là một số' })
  @IsPositive({ message: 'Port phải là một số dương' })
  readonly port: number;

  @ApiProperty({ description: 'Tên người dùng để kết nối cơ sở dữ liệu' })
  @IsString({ message: 'Username phải là một chuỗi' })
  @IsNotEmpty({ message: 'Username không được để trống' })
  readonly username: string;

  @ApiProperty({ description: 'Mật khẩu của người dùng cơ sở dữ liệu' })
  @IsString({ message: 'Password phải là một chuỗi' })
  @IsNotEmpty({ message: 'Password không được để trống' })
  readonly password: string;

  @ApiProperty({ description: 'Tên cơ sở dữ liệu' })
  @IsString({ message: 'DatabaseName phải là một chuỗi' })
  @IsNotEmpty({ message: 'DatabaseName không được để trống' })
  readonly databaseName: string;
}
