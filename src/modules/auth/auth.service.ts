import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from 'src/common/email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}
  async register(payload: RegisterDto, filename: string) {
    const existUser = await this.prisma.users.findFirst({
      where: {
        OR: [{ username: payload.username }, { email: payload.email }],
      },
    });
    if (existUser) {
      throw new BadRequestException('Username yoki email allaqachon mavjud');
    }

    const freePlan = await this.prisma.subscription_plan.findFirst({
      where:{
        name:"Free",
        is_active:true
      }
    })

    if(!freePlan){
      throw new NotFoundException("Free plan topilmadi")
    }

    const hashPass = await bcrypt.hash(payload.password, 10);
   const data = await this.prisma.users.create({
      data: {
        username: payload.username,
        email: payload.email,
        password: hashPass,
        avatar: filename ?? null,
        userSubscriptions:{
          create:{
            plan_id:freePlan.id,
            start_date:new Date(),
            end_date:new Date(Date.now() + 60 * 1000),
            status:'ACTIVE',
            auto_renew:false,
          }
        }
      },
       select: {
    id: true,
    username: true,
    email: true,
    role: true,
    avatar: true,
    created_at: true,
  },
    });

   

    await this.emailService.sendEmail(
      payload.email,
      payload.email,
      payload.password,
    );

    return {
      success: true,
      message: "Ro'yxatdan muvaffaqiyatli o'tdingiz",
      data:data
    };
  }

  async login(payload: LoginDto) {
    const existUser = await this.prisma.users.findFirst({
      where: {
        OR: [{ email: payload.email }, { username: payload.email }],
      },
    });

    if (!existUser) {
      throw new UnauthorizedException('email yoki parol xato');
    }

    const isMatch = await bcrypt.compare(payload.password, existUser.password);

    if (!isMatch) {
      throw new UnauthorizedException('email yoki parol xato');
    }

    const data = await this.prisma.users.findUnique({
      where: {
        id: existUser.id,
        username: existUser.username,
        role: existUser.role,
      },
    });

    return {
      success: true,
      message: 'Muvaffaqiyatli kirildi',
      accessToken: this.jwtService.sign({
        id: existUser.id,
        email: existUser.email,
        password: existUser.password,
        role: existUser.role,
      }),
      data: data,
    };
  }


  async loginAdmin(payload: LoginDto) {
    const existUser = await this.prisma.users.findFirst({
      where: {
        OR: [{ email: payload.email }, { username: payload.email }],
      },
    });

    if (!existUser) {
      throw new UnauthorizedException('email yoki parol xato');
    }

    const isMatch = await bcrypt.compare(payload.password, existUser.password);

    if (!isMatch) {
      throw new UnauthorizedException('email yoki parol xato');
    }

    const data = await this.prisma.users.findUnique({
      where: {
        id: existUser.id,
        username: existUser.username,
        role: existUser.role,
      },
    });

    return {
      success: true,
      message: 'Muvaffaqiyatli kirildi',
      accessToken: this.jwtService.sign({
        id: existUser.id,
        email: existUser.email,
        password: existUser.password,
        role: existUser.role,
      }),
      data: data,
    };
  }
}
