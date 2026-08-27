import { Body, Controller, Get, Post } from '@nestjs/common';
import { EmailService } from './email.service';
import { AuthService } from '../auth/auth.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService, private readonly auth: AuthService) { }
  @Post('verify')
  async verifyEmail(@Body() body: { email: string; code: string }) {
    const user = await this.emailService.verifyEmail(body.email, body.code);
    console.log(user)
    return this.auth.login(user);
  }

  @Post('resend-code')
  async resendCode(@Body() body: { email: string }) {
    return this.emailService.resendCode(body.email);
  }
}
