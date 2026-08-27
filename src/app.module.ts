import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { BlogModule } from './blog/blog.module';
import { ProfileModule } from './profile/profile.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [UsersModule, ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: ['atlas-credentials.env', '.env'],
  }), MongooseModule.forRoot(process.env.MONGODB_URI || ''), AuthModule, BlogModule, ProfileModule, EmailModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
