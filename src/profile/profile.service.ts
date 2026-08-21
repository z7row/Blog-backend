import { Injectable, BadRequestException } from '@nestjs/common';
import { CloudinaryService } from '../blog/cloudinary.service';

@Injectable()
export class ProfileService {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  async uploadfile(files: Array<Express.Multer.File>): Promise<{ url: string }> {
    if (!files || files.length === 0) {
      throw new BadRequestException('Please choose a file first!');
    }

    const url = await this.cloudinaryService.uploadFile(files[0]);
    return { url };
  }

}