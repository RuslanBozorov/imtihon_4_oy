import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreateUserDto } from './dto/create.user.dto';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { EmailService } from 'src/common/email/email.service';
@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async getAllUsers() {
    const existUsers = await this.prisma.users.findMany({
      where:{status:true}
    });

    if (!existUsers) {
      throw new NotFoundException('Userlar mavjud emas!');
    }

    return {
      success: true,
      message: 'Barcha userlar',
      data: existUsers,
    };
  }

  async getSingleUser(id: number | string) {
    const existUser = await this.prisma.users.findUnique({
      where: { id: Number(id) },
    });

    if (!existUser) throw new NotFoundException('user topilmadi!');

    return {
      success: true,
      message: `shu ${id} li user topildi`,
      data: existUser,
    };
  }

  async getMe(userId: number) {
    const data = await this.prisma.users.findUnique({
      where: { id: userId },
      select: {
        username: true,
        email: true,
        password: true,
        role: true,
        avatar: true,
      },
    });

    if (!data) throw new NotFoundException('User topilmadi');

    return {
      success: true,
      message: 'Sizning malumotlaringiz',
      data: data,
    };
  }


  async getInActiveUser(){
    const data = await this.prisma.users.findMany({
      where:{status:false}
    })

    if(data.length == 0){
      throw new NotFoundException("Inactive Userlar topilmadi!")
    }

    return {
      success:true,
      message:"Inactive userlar",
      data:data
    }
  }


  async createUser(dto: CreateUserDto, filename: string) {
    const existUser = await this.prisma.users.findFirst({
      where: {
        OR: [{ email: dto.email }, { username: dto.username }],
      },
    });

    if (existUser) {
      throw new ConflictException('Bu user mavjud');
    }
    const hashPass = await bcrypt.hash(dto.password, 10);
    const data = await this.prisma.users.create({
      data: {
        username: dto.username,
        email: dto.email,
        password: hashPass,
        avatar: filename ?? null,
      },
    });

    await this.emailService.sendEmail(dto.email, dto.email, dto.password);

    return {
      success: true,
      message: 'User yaratildi',
      data: data,
    };
  }

  async createAdmin(dto: CreateUserDto, filename: string) {
    const existUser = await this.prisma.users.findFirst({
      where: {
        OR: [{ email: dto.email }, { username: dto.username }],
      },
    });

    if (existUser) {
      throw new ConflictException('Bu user mavjud');
    }
    const hashPass = await bcrypt.hash(dto.password, 10);
    const data = await this.prisma.users.create({
      data: {
        username: dto.username,
        email: dto.email,
        password: hashPass,
        avatar: filename ?? null,
        role: Role.ADMIN,
      },
    });

    await this.emailService.sendEmail(dto.email, dto.email, dto.password);

    return {
      success: true,
      message: 'User yaratildi',
      data: data,
    };
  }

  async updateMe(userId: number, filename: string, dto: CreateUserDto) {
    const existUser = await this.prisma.users.findUnique({
      where: { id: Number(userId) },
    });

    if (!existUser) throw new NotFoundException('user topilmadi!');

    const data: any = {};

    if (typeof dto.username === 'string' && dto.username.trim() !== '') {
      data.username = dto.username.trim();
    }

    if (typeof dto.email === 'string' && dto.email.trim() !== '') {
      data.email = dto.email.trim();
    }

    if (typeof dto.password === 'string' && dto.password.trim() !== '') {
      data.password = await bcrypt.hash(dto.password.trim(), 10);
    }

    if (filename) {
      data.avatar = filename;
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException(
        "Yangilash uchun hech qanday ma'lumot yuborilmadi",
      );
    }

    const update = await this.prisma.users.update({
      where: { id: Number(userId) },
      data,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        password: true,
        avatar: true,
      },
    });

    return {
      success: true,
      mesage: 'Yangilandi',
      data: update,
    };
  }

  async updateUser(id: number, filename: string, dto: CreateUserDto) {
    const existUser = await this.prisma.users.findUnique({
      where: { id: Number(id) },
    });

    if (!existUser) throw new NotFoundException('user topilmadi!');

    const data: any = {};

    if (typeof dto.username === 'string' && dto.username.trim() !== '') {
      data.username = dto.username.trim();
    }

    if (typeof dto.email === 'string' && dto.email.trim() !== '') {
      data.email = dto.email.trim();
    }

    if (typeof dto.password === 'string' && dto.password.trim() !== '') {
      data.password = await bcrypt.hash(dto.password.trim(), 10);
    }

    if (filename) {
      data.avatar = filename;
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException(
        "Yangilash uchun hech qanday ma'lumot yuborilmadi",
      );
    }

    const update = await this.prisma.users.update({
      where: { id: Number(id) },
      data,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        password: true,
        avatar: true,
      },
    });

    return {
      success: true,
      mesage: 'Yangilandi',
      data: update,
    };
  }

  async deleteUser(id: number) {
    const existUser = await this.prisma.users.findUnique({
      where: { id: Number(id) },
    });

    if (!existUser) throw new NotFoundException('user topilmadi!');

    const data = await this.prisma.users.update({
      where: { id },
      data:{status:false}
      
    });
    return {
      success: true,
      message: "User o'chirildi",
      data: data,
    };
  }
}
