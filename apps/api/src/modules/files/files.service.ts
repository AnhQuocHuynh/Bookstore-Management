import { CloudinaryService } from '@kaidenki/nestjs-cloudinary';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FilesService {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  async uploadFile(file: Express.Multer.File) {
    const response = await this.cloudinaryService.uploadFile(file);
    return {
      url: response.secure_url as string,
    };
  }
}
