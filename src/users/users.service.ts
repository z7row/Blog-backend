import { Body, ConflictException, ForbiddenException, forwardRef, Inject, Injectable, NotFoundException, ValidationPipe } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schema/user.schema';
import * as bcrypt from 'bcrypt';
import { EmailService } from '../email/email.service';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>
  ,  @Inject(forwardRef(() => EmailService))
  private emailService: EmailService
  ) { }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userModel.findOne({ email: createUserDto.email });
    if (existingUser) {
      throw new ConflictException('this email already exist');
    }

    const saltOrRounds = 10;
    const password = createUserDto.password
    const hashPassword = await bcrypt.hash(password, saltOrRounds);
    const otp = this.generateOTP();
    const expires = new Date(Date.now() + 10 * 60 * 1000);
    const createdUser = new this.userModel({
      ...createUserDto, password: hashPassword, verificationCode: otp,
      verificationCodeExpires: expires,
      isVerified: false,
    })
    // console.log(createUserDto.email, otp)
  const sendemail = await this.emailService.sendVerificationEmail(createUserDto.email, otp)
  if (!sendemail){

   throw new Error("eror email")
  }
  return createdUser.save();
}



  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not Found 404');
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    const { name, pio, profilephoto, banner } = updateUserDto;
    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      { name, pio, profilephoto, banner },
      { returnDocument: 'after' }
    );

    if (!updatedUser) {
      throw new NotFoundException("user not found");
    }
    return updatedUser;
  }

  async remove(id: string, userId: string) {
    const user = await this.userModel.findById(id);
    if (!user || user.isDeleted == true) {
      throw new NotFoundException("user not found");
    }
    const usermake = userId;
    console.log(usermake)
    const usermakedb = await this.userModel.findById(userId);
    const usermakerole = usermakedb?.role
    console.log(usermakedb, usermakerole)
    if (usermakerole == 'admin') {
      await this.userModel.findByIdAndUpdate(id,
        {
          name: "Deleted Account",
          email: "deleted: " + user?.email,
          password: '',
          isDeleted: true
        },
        { returnDocument: 'after' })
      return { message: 'user deleted succesfully' }
    }
    if (userId != id) {
      throw new ForbiddenException("روح يا عم شوف مجال تاني متقرفناش")
    }


    await this.userModel.findByIdAndUpdate(id,
      {
        name: "Deleted Account",
        email: "deleted: " + user?.email,
        password: '',
        isDeleted: true
      },
      { returnDocument: 'after' })


    return { message: 'user deleted succesfully' };
  }


  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }
}
