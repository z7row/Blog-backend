import { Injectable, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadFile(file: any): Promise<string> {
    if (!file || !file.buffer) {
      throw new BadRequestException('not good file');
    }
    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = `data:${file.mimetype};base64,${b64}`;

    try {
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'blogs',
        resource_type: 'auto',
      });
      return result.secure_url;
    } catch (error) {
      console.error('Cloudinary Error Details:', error);
      throw new BadRequestException('there is an error on  upload file to Cloudinary');
    }
  }
}