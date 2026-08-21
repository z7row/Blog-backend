import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from './guard/roles.decorator';
import { RolesGuard } from './guard/roles.guard';
import { ParseObjectIdPipe } from '@nestjs/mongoose';


@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }
  
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
   
    return this.usersService.create(createUserDto);
  }

  
  @Get()
  findAll( @Request() req) {
     console.log(req)
     const userId = req.user.userId;
     console.log(userId)

    return this.usersService.findAll();
  }

  
  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.usersService.findOne(id);
  }

  
  @Patch(':id')
  update(@Param('id', ParseObjectIdPipe) id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }
  
  @Delete(':id')
  remove(@Param('id', ParseObjectIdPipe) id: string, @Request() req) {
    const userId = req.user.userId;

    return this.usersService.remove(id, userId);
  }
}
