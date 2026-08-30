import { Inject, forwardRef, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { EmailService } from '../email/email.service';
import { HydratedDocument } from 'mongoose';
import { User } from '../users/schema/user.schema';
import * as crypto from 'crypto';
@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => EmailService))
    private readonly emailService: EmailService,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _, ...result } = user.toObject();
    return result;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user._id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(name: string, email: string, password: string) {
    await this.usersService.create({ name, email, password });


    return { message: "check your email for code " };
  }

  async validateGoogleUser(dto: { email: string; name: string; image?: string; googleId: string }) {
    const userisemailed = await this.usersService.findByEmail(dto.email);
    if (userisemailed) {
      const userId = (userisemailed as any)._id || (userisemailed as any).id;
      const payload = { sub: userId, email: userisemailed.email };
      const accessToken = this.jwtService.sign(payload);
       return { accessToken, userisemailed };
    }
    const randomPassword = crypto.randomBytes(16).toString('hex');
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const user = await this.usersService.create({
      email: dto.email,
      name: dto.name,
      profilephoto: dto.image,
      googleId: dto.googleId,
      provider: 'google',
      password: hashedPassword,
    });
    // if (!userd) {
    //   throw new UnauthorizedException('Failed to authenticate with Google');
    // }

    const userId = (userisemailed as any)._id || (userisemailed as any).id;

    const payload = { sub: userId, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken, user };
  }
}