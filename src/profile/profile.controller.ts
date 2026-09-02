import { Body, Controller, Get, NotFoundException, Param, Patch, Post, Query, Request, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { BlogService } from '../blog/blog.service';
import { CloudinaryService } from '../blog/cloudinary.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { ParseObjectIdPipe } from '@nestjs/mongoose';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService
    , private readonly usersService: UsersService
    , private readonly blogService: BlogService
    , private readonly cloudinaryService: CloudinaryService
  ) { }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  profile(@Request() req) {
    const userId = req.user.userId;
    return this.usersService.findOne(userId);
  }

  @Get(':id')
  profileUser(@Param('id', ParseObjectIdPipe) id: string) {
    const userId = id;
    const user = this.usersService.findOne(userId);

    if (!user) {
      throw new NotFoundException('user not found');
    }
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('/me/photo')
  @UseInterceptors(AnyFilesInterceptor())
  async photo(@Request() req, @UploadedFiles() files: Array<Express.Multer.File>) {
    const userId = req.user.userId;
    const user = this.usersService.findOne(userId);

    if (!user) {
      throw new NotFoundException('user not found');
    }
    if (!files) {
      throw new NotFoundException("متبعت الملف يا عم وارتاح وريحنا")

    }
    const fileurl = await this.profileService.uploadfile(files);
    // console.log(fileurl.url)
    const myphoto = this.usersService.update(userId, { profilephoto: fileurl.url })

    return myphoto
  }


  @UseGuards(JwtAuthGuard)
  @Post('/me/banner')
  @UseInterceptors(AnyFilesInterceptor())
  async banner(@Request() req, @UploadedFiles() files: Array<Express.Multer.File>) {
    const userId = req.user.userId;
    const user = this.usersService.findOne(userId);

    if (!user) {
      throw new NotFoundException('user not found');
    }
    if (!files) {
      throw new NotFoundException("متبعت الملف يا عم وارتاح وريحنا")

    }
    const fileurl = await this.profileService.uploadfile(files);
    // console.log(fileurl.url)
    const myphoto = this.usersService.update(userId, { banner: fileurl.url })

    return myphoto
  }



  @UseGuards(JwtAuthGuard)
  @Patch('me/edit/')
  edit(@Request() req, @Body() UpdateUserDto: UpdateUserDto) {
    const userId = req.user.userId;
    const user = this.usersService.findOne(userId);

    if (!user) {
      throw new NotFoundException('user not found');
    }
    console.log(UpdateUserDto)
    return this.usersService.update(userId, UpdateUserDto);
  }



  @UseGuards(JwtAuthGuard)
  @Get('me/get-posts/')
  getposts(@Request() req) {
    const userId = req.user.userId;
    const user = this.usersService.findOne(userId);

    if (!user) {
      throw new NotFoundException('user not found');
    }
    return this.blogService.getUserBlogs(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/get-comments/')
  comments(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,) {
    const userId = req.user.userId;
    const user = this.usersService.findOne(userId);

    if (!user) {
      throw new NotFoundException('user not found');
    }
    return this.blogService.getUserComments(userId, page, limit);
  }

  @Get(':userId/get-posts/')
  getidposts(@Param('userId', ParseObjectIdPipe) userId: string,
  @Query('page') page?: number,
    @Query('limit') limit?: number,) {
    const user = this.usersService.findOne(userId);

    if (!user) {
      throw new NotFoundException('user not found');
    }
    return this.blogService.getUserBlogs(userId, page, limit);
  }


  @Get('/:userId/get-comments/')
  async getUserComments(
    @Param('userId', ParseObjectIdPipe) userId: string,
  ) {
    return this.blogService.getUserComments(userId);
  }

}
