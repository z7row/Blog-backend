import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/schema/user.schema';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class EmailService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    // @Inject(forwardRef(() => AuthService))
    // private readonly authService: AuthService,
  ) {}

  async sendVerificationEmail(targetEmail: string, code: string) {

    const apiKey = process.env.BREVO_API_KEY || '';
    const senderEmail = process.env.BREVO_SENDER_EMAIL || '';
    if (!apiKey) {
      throw new Error('BREVO_API_KEY is not defined in environment variables');
    }
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY!,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'Blog App',
          email: senderEmail,
        },
        to: [{ email: targetEmail }],
        subject: `Code varification`,
        htmlContent: `
       <div style="font-family: sans-serif; padding: 24px; background-color: #08140A; color: #FEFAE0; border-radius: 12px;">
        <h2 style="color: #DDA15E;">Verify Your Email</h2>
        <p>Your 6-digit verification code is:</p>
        <div style="background: transparent; border: 1px dashed #DDA15E; padding: 16px; border-radius: 8px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #DDA15E; margin: 20px 0;">
          ${code}
        </div>
        <p style="font-size: 12px; opacity: 0.7;">Valid for 10 minutes only.</p>
      </div>
        `,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('Brevo Error:', err);
      return err
    }
    return response.ok
  }

  async verifyEmail(email: string, code: string) {
    const user = await this.userModel.findOne({ email });

    if (!user) throw new NotFoundException('user not found');
    if (user.isVerified) throw new BadRequestException('has verifide before');

    if (user.verificationCode !== code) {
      throw new BadRequestException('un true code');
    }

    if (new Date() > user.verificationCodeExpires) {
      throw new BadRequestException('setion expired');
    }

    user.isVerified = true;
    user.verificationCode = null as any;
    user.verificationCodeExpires = null as any;
    await user.save();

    return user
  }
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async resendCode(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException('user not found');

    const otp = this.generateOTP();
    user.verificationCode = otp;
    user.verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await this.sendVerificationEmail(email, otp);
    // return this.authService.login(user);
  }
}
