import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, UseInterceptors, UploadedFile, UploadedFiles, BadRequestException } from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import type { Multer } from 'multer';


@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService,private readonly cloudinaryService: CloudinaryService) { }



  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createBlogDto: CreateBlogDto, @Request() req) {
    const userId = req.user.userId;
    return this.blogService.create(createBlogDto, userId);

  }

  @Get()
  findAll() {
    return this.blogService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogService.findOne(id);
  }


  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto, @Request() req) {
    const userId = req.user.userId;
    return this.blogService.update(id, updateBlogDto, userId);
  }


  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    const userId = req.user.userId;
    return this.blogService.remove(id, userId);
  }


  // Toggle Like
  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  toggleLike(@Param('id') id: string, @Request() req) {
    return this.blogService.toggleLike(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/comment')
  addComment(
    @Param('id') id: string,
    @Body('content') content: string,
    @Request() req,
  ) {
    return this.blogService.addComment(id, req.user.userId, content);
  }


  @Get(':id/comments')
  getComments(@Param('id') id: string) {
    return this.blogService.getComments(id);
  }


  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(AnyFilesInterceptor())
  async uploadMedia(@UploadedFiles() files: Array<Express.Multer.File>) {
    if (!files || files.length === 0) {
      throw new BadRequestException('chose file friest!');
    }
    
    const url = await this.cloudinaryService.uploadFile(files[0]);
    return { url };
  }
}
