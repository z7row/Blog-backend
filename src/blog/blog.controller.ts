import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, UseInterceptors, UploadedFiles, BadRequestException, Query, Req, UploadedFile } from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import type { Request as ExpressRequest } from 'express'; 
@Controller('blog')
export class BlogController {
  constructor(
    private readonly blogService: BlogService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadMedia(@UploadedFile() file: any) {
  
   if (!file) { 
      throw new BadRequestException('chose file friest!');
    }
    const url = await this.cloudinaryService.uploadFile(file);
    return { url };
  }
  @UseGuards(JwtAuthGuard)
  @Get('/c/:id')
  canupdate(
    @Param('id', ParseObjectIdPipe) id: string,
    @Request() req,
  ) {
    const userId = req.user.userId;
    const userRole = req.user.role;
    return this.blogService.canupdate(id, userId, userRole);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createBlogDto: CreateBlogDto, @Request() req) {
    const userId = req.user.userId;
    return this.blogService.create(createBlogDto, userId);
  }

  @Get()
  findAll(@Query('page') page: number = 1) {
    return this.blogService.findAll(+page);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseObjectIdPipe) id: string,
    @Req() req: ExpressRequest, 
  ) {
    const clientIp =
      (req.headers['x-forwarded-for'] as string) ||
      req.ip ||
      req.socket.remoteAddress ||
      '127.0.0.1';

    await this.blogService.MakeViews(id, clientIp);
    return this.blogService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateBlogDto: UpdateBlogDto,
    @Request() req,
  ) {
    const userId = req.user.userId;
    const userRole = req.user.role;
    return this.blogService.update(id, updateBlogDto, userId, userRole);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseObjectIdPipe) id: string, @Request() req) {
    const userId = req.user.userId;
    const userRole = req.user.role;
    return this.blogService.remove(id, userId, userRole);
  }

  // Toggle Like
  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  toggleLike(@Param('id', ParseObjectIdPipe) id: string, @Request() req) {
    return this.blogService.toggleLike(id, req.user.userId);
  }

  // Views
  @Post(':id/view')
  views(@Param('id', ParseObjectIdPipe) id: string, @Req() req: ExpressRequest) {
    const clientIp =
      (req.headers['x-forwarded-for'] as string) ||
      req.ip ||
      req.socket.remoteAddress ||
      '127.0.0.1';

    return this.blogService.MakeViews(id, clientIp);
  }

  // add comment
  @UseGuards(JwtAuthGuard)
  @Post(':id/comment')
  addComment(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body('content') content: string,
    @Request() req,
  ) {
    return this.blogService.addComment(id, req.user.userId, content);
  }

  // get comments
  @Get(':id/comments')
  getComments(@Param('id', ParseObjectIdPipe) id: string) {
    return this.blogService.getComments(id);
  }

  @UseGuards(JwtAuthGuard)
@Delete(':blogId/comment/:commentId')
async deleteComment(
  @Param('blogId') blogId: string,
  @Param('commentId') commentId: string,
  @Req() req: any,
) {
  const userId = req.user._id || req.user.userId;
  return this.blogService.deleteComment(blogId, commentId, userId);
}

@UseGuards(JwtAuthGuard)
@Patch(':blogId/comment/:commentId')
async updateComment(
  @Param('blogId') blogId: string,
  @Param('commentId') commentId: string,
  @Body('content') content: string,
  @Req() req: any,
) {
  const userId = req.user._id || req.user.userId;
  console.log(req.user)
  return this.blogService.updateComment(blogId, commentId, userId, content);
}
}