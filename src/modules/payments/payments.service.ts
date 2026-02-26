import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role, paymentsStatus, subscriptionStatus } from '@prisma/client';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreatePaymentDto, UpdatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(user: { id: number; role: Role }, payload: CreatePaymentDto) {
    const subscription = await this.prisma.user_subscriptions.findUnique({
      where: { id: payload.user_subscripion_id },
    });

    if (!subscription) throw new NotFoundException('Obuna topilmadi');
    if (user.role === Role.USER && subscription.user_id !== user.id) {
      throw new ForbiddenException(
        "Faqat o'zingizning obunangiz uchun to'lov yarata olasiz",
      );
    }

    const payment = await this.prisma.payments.create({
      data: {
        user_subscripion_id: payload.user_subscripion_id,
        amount: payload.amount,
        payment_method: payload.payment_method,
        payment_details: payload.payment_details ?? {},
      },
    });
    
    if (payment.status === paymentsStatus.COMPLETED) {
      await this.prisma.user_subscriptions.update({
        where: { id: payload.user_subscripion_id },
        data: { status: subscriptionStatus.ACTIVE },
      });
    }

    return { success: true, data: payment };
  }

  async findAll() {
    const payments = await this.prisma.payments.findMany({
      include: { user_subscriptions: { include: { user: true, plan: true } } },
    });
    return { success: true, data: payments };
  }

  async findMyPayments(user: { id: number }) {
    const payments = await this.prisma.payments.findMany({
      where: {
        user_subscriptions: {
          user_id: Number(user.id),
        },
      },
      include: { user_subscriptions: { include: { user: true, plan: true } } },
      orderBy: { created_at: 'desc' },
    });

    return { success: true, data: payments };
  }

  async findOne(id: number) {
    const payment = await this.prisma.payments.findUnique({
      where: { id: Number(id) },
      include: { user_subscriptions: { include: { user: true, plan: true } } },
    });

    if (!payment) throw new NotFoundException('Payment topilmadi');

    return { success: true, data: payment };
  }

  async update(id: number, payload: UpdatePaymentDto) {
    const payment = await this.prisma.payments.findUnique({
      where: { id: Number(id) },
    });

    if (!payment) throw new NotFoundException('Payment topilmadi');

    const updated = await this.prisma.payments.update({
      where: { id: Number(id) },
      data: payload,
    });

    if (payload.status === 'COMPLETED') {
      await this.prisma.user_subscriptions.update({
        where: { id: payment.user_subscripion_id },
        data: { status: 'ACTIVE' },
      });
    }

    return { success: true, data: updated };
  }

  // async delete(id: number) {
  //   const payment = await this.prisma.payments.findUnique({
  //     where: { id: Number(id) },
  //   });

  //   if (!payment) throw new NotFoundException('Payment topilmadi');

  //   await this.prisma.payments.update({
  //      where: { id: Number(id) },
  //      data:{status:}
      
  //     });

  //   return { success: true, message: 'Payment o\'chirildi' };
  // }
}
