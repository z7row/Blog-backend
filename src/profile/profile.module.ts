import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { UsersModule } from '../users/users.module';
import { BlogModule } from '../blog/blog.module';
import { CloudinaryService } from '../blog/cloudinary.service';

@Module({
  imports: [
    UsersModule, 
    BlogModule,  
  ],
  controllers: [ProfileController],
  providers: [ProfileService, CloudinaryService],
})
export class ProfileModule {}
