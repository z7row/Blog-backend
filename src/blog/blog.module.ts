import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { MongooseModule } from '@nestjs/mongoose';

import { Blog, BlogSchema, Comment } from './schema/blog.schema';
import { AuthModule } from '../auth/auth.module';
import { CloudinaryService } from './cloudinary.service';



@Module({
  imports: [MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),MongooseModule.forFeature([{ name: Comment.name, schema: BlogSchema }]),AuthModule],
  controllers: [BlogController, ],
  providers: [BlogService,CloudinaryService],
  exports: [BlogService, CloudinaryService]
})
export class BlogModule {}
