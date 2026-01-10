import {
  Controller,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BadRequestException } from '@nestjs/common';

@Controller('files')
@ApiTags('Upload File') // Đặt tên nhóm API cho dễ tìm
@ApiBearerAuth()
export class FilesController {
  constructor(private readonly filesService: FilesService) { }

  @ApiOperation({
    summary: 'Upload file',
    description: 'Đường dẫn này dùng để upload file.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File cần upload',
    type: 'multipart/form-data',
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    example: {
      url: 'https://...',
    },
  })
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Không tìm thấy file. Vui lòng kiểm tra key gửi lên phải là "file".');
    }
    return this.filesService.uploadFile(file);
  }
}
