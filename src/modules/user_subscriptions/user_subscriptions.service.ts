import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Role, subscriptionStatus } from '@prisma/client';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreateUserSubscriptionDto } from './dto/create.dto';
import {
  UpdateMyUserSubscriptionDto,
  UpdateUserSubscriptionDto,
} from './dto/update.dto';

@Injectable()
export class UserSubscriptionsService {
  constructor(private prisma: PrismaService) {}

  private readonly subscriptionLifetimeMs = 60 * 1000;

  private calcEndDate(startDate: Date) {
    return new Date(startDate.getTime() + this.subscriptionLifetimeMs);
  }

  @Cron(CronExpression.EVERY_SECOND)
  async handleExpireSubscriptionsCron() {
    await this.expireSubscriptions();
  }

  private async expireSubscriptions() {
    const now = new Date();

    const expiredSubs = await this.prisma.user_subscriptions.findMany({
      where: {
        end_date: { lte: now },
        status: { in: [subscriptionStatus.ACTIVE, subscriptionStatus.EXPIRED] },
      },
      include: {
        plan: true,
      },
    });

    for (const sub of expiredSubs) {
      if (sub.auto_renew && sub.plan.is_active) {
        const newStart = now;
        const newEnd = new Date(newStart);
        newEnd.setDate(newEnd.getDate() + sub.plan.duration_days);

        await this.prisma.user_subscriptions.update({
          where: { id: sub.id },
          data: {
            start_date: newStart,
            end_date: newEnd,
            status: subscriptionStatus.ACTIVE,
          },
        });
      } else {
        await this.prisma.user_subscriptions.update({
          where: { id: sub.id },
          data: { status: subscriptionStatus.EXPIRED },
        });
      }
    }
  }

  async create(user: { id: number; role: Role }, payload: CreateUserSubscriptionDto) {
    await this.expireSubscriptions();

    let userId: number;
    if (user.role === Role.USER) {
      userId = user.id;
    } else {
      if (payload.user_id === undefined) {
        throw new BadRequestException("Admin uchun user_id yuborilishi shart");
      }
      userId = Number(payload.user_id);
    }

    const existUser = await this.prisma.users.findUnique({
      where: { id: Number(userId) },
      select: { id: true, status: true },
    });

    if (!existUser || !existUser.status)
      throw new NotFoundException('User topilmadi');

    const plan = await this.prisma.subscription_plan.findUnique({
      where: { id: Number(payload.plan_id) },
      select: { id: true, is_active: true },
    });

    if (!plan || !plan.is_active) throw new NotFoundException('Plan topilmadi');

    const alreadySubscribed = await this.prisma.user_subscriptions.findFirst({
      where: {
        user_id: Number(userId),
        plan_id: Number(payload.plan_id),
        status: { in: [subscriptionStatus.ACTIVE, subscriptionStatus.PENDENG] },
      },
      select: { id: true },
    });

    if (alreadySubscribed) {
      throw new ConflictException("Siz obuna bo'lgansiz");
    }

    await this.prisma.user_subscriptions.updateMany({
      where: {
        user_id: Number(userId),
        status: { in: [subscriptionStatus.ACTIVE, subscriptionStatus.PENDENG] },
      },
      data: { status: subscriptionStatus.CANCELED },
    });

    const startDate = new Date();
    const endDate = this.calcEndDate(startDate);

    const subscription = await this.prisma.user_subscriptions.create({
      data: {
        user_id: Number(userId),
        plan_id: Number(plan.id),
        start_date: startDate,
        end_date: endDate,
        auto_renew: payload.auto_renew ?? false,
        status: subscriptionStatus.PENDENG,
      },
      select: {
        id: true,
        user_id: true,
        plan_id: true,
        start_date: true,
        end_date: true,
        status: true,
        auto_renew: true,
        created_at: true,
      },
    });

    return { success: true, data: subscription };
  }

  async findAll() {
    await this.expireSubscriptions();

    const subscriptions = await this.prisma.user_subscriptions.findMany({
      where: { user: { status: true } },
      select: {
        id: true,
        user_id: true,
        plan_id: true,
        start_date: true,
        end_date: true,
        status: true,
        auto_renew: true,
        created_at: true,
        update_at: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            status: true,
            avatar: true,
          },
        },
        plan: {
          select: {
            id: true,
            name: true,
            price: true,
            duration_days: true,
            features: true,
            is_active: true,
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            payment_method: true,
            status: true,
            created_at: true,
          },
          orderBy: { created_at: 'desc' },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return { success: true, data: subscriptions };
  }

  async findAllActive() {
    await this.expireSubscriptions();

    const subscriptions = await this.prisma.user_subscriptions.findMany({
      where: {
        user: { status: true },
        status: subscriptionStatus.ACTIVE,
      },
      select: {
        id: true,
        user_id: true,
        plan_id: true,
        start_date: true,
        end_date: true,
        status: true,
        auto_renew: true,
        created_at: true,
        update_at: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            status: true,
            avatar: true,
          },
        },
        plan: {
          select: {
            id: true,
            name: true,
            price: true,
            duration_days: true,
            features: true,
            is_active: true,
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            payment_method: true,
            status: true,
            created_at: true,
          },
          orderBy: { created_at: 'desc' },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return { success: true, data: subscriptions };
  }

  async findAllInactive() {
    await this.expireSubscriptions();

    const subscriptions = await this.prisma.user_subscriptions.findMany({
      where: {
        user: { status: true },
        status: {
          in: [
            subscriptionStatus.EXPIRED,
            subscriptionStatus.CANCELED,
            subscriptionStatus.PENDENG,
          ],
        },
      },
      select: {
        id: true,
        user_id: true,
        plan_id: true,
        start_date: true,
        end_date: true,
        status: true,
        auto_renew: true,
        created_at: true,
        update_at: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            status: true,
            avatar: true,
          },
        },
        plan: {
          select: {
            id: true,
            name: true,
            price: true,
            duration_days: true,
            features: true,
            is_active: true,
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            payment_method: true,
            status: true,
            created_at: true,
          },
          orderBy: { created_at: 'desc' },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return { success: true, data: subscriptions };
  }

  async findOne(id: number) {
    await this.expireSubscriptions();

    const subscription = await this.prisma.user_subscriptions.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        user_id: true,
        plan_id: true,
        start_date: true,
        end_date: true,
        status: true,
        auto_renew: true,
        created_at: true,
        update_at: true,
        plan: {
          select: {
            id: true,
            name: true,
            price: true,
            duration_days: true,
            features: true,
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            payment_method: true,
            status: true,
            created_at: true,
          },
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!subscription) throw new NotFoundException('Obuna topilmadi');

    return { success: true, data: subscription };
  }

 
  async findMyActive(user: { id: number }) {
    await this.expireSubscriptions();

    const subscriptions = await this.prisma.user_subscriptions.findMany({
      where: {
        user_id: Number(user.id),
        status: subscriptionStatus.ACTIVE,
      },
      select: {
        id: true,
        plan_id: true,
        start_date: true,
        end_date: true,
        status: true,
        auto_renew: true,
        created_at: true,
        plan: {
          select: {
            id: true,
            name: true,
            price: true,
            duration_days: true,
            features: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    if(subscriptions.length === 0){
        throw new NotFoundException("Aktiv obunalar topilmadi!")
    }

    return { success: true, data: subscriptions };
  }

  async findMyHistory(user: { id: number }) {
    await this.expireSubscriptions();

    const subscriptions = await this.prisma.user_subscriptions.findMany({
      where: {
        user_id: Number(user.id),
        status: { in: [subscriptionStatus.EXPIRED, subscriptionStatus.CANCELED] },
      },
      select: {
        id: true,
        plan_id: true,
        start_date: true,
        end_date: true,
        status: true,
        auto_renew: true,
        created_at: true,
        plan: {
          select: {
            id: true,
            name: true,
            price: true,
            duration_days: true,
            features: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    if(subscriptions.length === 0){
        throw new NotFoundException("Arxivlar mavjud emas!")
    }

    return { success: true, data: subscriptions };
  }

  async myUpdate(
    currentUser: { id: number },
    payload: UpdateMyUserSubscriptionDto,
  ) {
    await this.expireSubscriptions();

    if (payload.auto_renew === undefined) {
      throw new BadRequestException(
        "Siz faqat auto_renew maydonini yangilashingiz mumkin",
      );
    }

    let exist = await this.prisma.user_subscriptions.findFirst({
      where: {
        user_id: Number(currentUser.id),
        status: {
          in: [subscriptionStatus.ACTIVE, subscriptionStatus.PENDENG],
        },
      },
      orderBy: { created_at: 'desc' },
      select: { id: true },
    });

    if (!exist) {
      exist = await this.prisma.user_subscriptions.findFirst({
        where: {
          user_id: Number(currentUser.id),
        },
        orderBy: { created_at: 'desc' },
        select: { id: true },
      });
    }

    if (!exist) throw new NotFoundException('Obuna topilmadi');

    const data: Record<string, any> = { auto_renew: payload.auto_renew };

    if (payload.auto_renew === false) {
      data.end_date = this.calcEndDate(new Date());
    }

    const updated = await this.prisma.user_subscriptions.update({
      where: { id: exist.id },
      data,
      select: {
        id: true,
        user_id: true,
        plan_id: true,
        start_date: true,
        end_date: true,
        status: true,
        auto_renew: true,
        update_at: true,
      },
    });

    return {
      success: true,
      message: "Obuna auto_renew yangilandi",
      data: updated,
    };
  }

  async update(id: number, payload: UpdateUserSubscriptionDto) {
    await this.expireSubscriptions();

    const exist = await this.prisma.user_subscriptions.findUnique({
      where: { id: Number(id) },
      select: { id: true, plan_id: true, start_date: true },
    });

    if (!exist) throw new NotFoundException('Obuna topilmadi');

    const data: Record<string, any> = {};
    let nextStartDate = exist.start_date;
    let shouldRecalculateEndDate = false;

    if (payload.user_id !== undefined) {
      const existUser = await this.prisma.users.findUnique({
        where: { id: Number(payload.user_id) },
        select: { id: true },
      });
      if (!existUser) throw new NotFoundException('User topilmadi');
      data.user_id = Number(payload.user_id);
    }

    if (payload.plan_id !== undefined) {
      const existPlan = await this.prisma.subscription_plan.findUnique({
        where: { id: Number(payload.plan_id) },
        select: { id: true, is_active: true },
      });
      if (!existPlan || !existPlan.is_active)
        throw new NotFoundException('Plan topilmadi');
      data.plan_id = Number(payload.plan_id);
      shouldRecalculateEndDate = true;
    }

    if (payload.status !== undefined) {
      data.status = payload.status;
    }

    if (payload.start_date !== undefined) {
      nextStartDate = new Date(payload.start_date);
      data.start_date = nextStartDate;
      shouldRecalculateEndDate = true;
    }

    if (payload.end_date !== undefined) {
      data.end_date = new Date(payload.end_date);
    }

    if (shouldRecalculateEndDate && payload.end_date === undefined) {
      data.end_date = this.calcEndDate(nextStartDate);
    }

    if (payload.auto_renew !== undefined) {
      data.auto_renew = payload.auto_renew;
    }

    if (payload.auto_renew === false && payload.end_date === undefined) {
      data.end_date = this.calcEndDate(new Date());
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException("Yangilash uchun ma'lumot yuborilmadi");
    }

    const updated = await this.prisma.user_subscriptions.update({
      where: { id: Number(id) },
      data,
      select: {
        id: true,
        user_id: true,
        plan_id: true,
        start_date: true,
        end_date: true,
        status: true,
        auto_renew: true,
        update_at: true,
      },
    });

    return { success: true, data: updated };
  }

  async myDelete(currentUser: { id: number }) {
    await this.expireSubscriptions();

    const exist = await this.prisma.user_subscriptions.findFirst({
      where: {
        user_id: Number(currentUser.id),
        status: {
          in: [subscriptionStatus.ACTIVE, subscriptionStatus.PENDENG],
        },
      },
      orderBy: { created_at: 'desc' },
      select: { id: true },
    });

    if (!exist) {
      throw new NotFoundException("O'chirish uchun faol obuna topilmadi");
    }

    await this.prisma.user_subscriptions.update({
      where: { id: exist.id },
      data: {
        status: subscriptionStatus.CANCELED,
        auto_renew: false,
        end_date: new Date(),
      },
    });

    return { success: true, message: "Obunangiz o'chirildi" };
  }

  async delete(id: number) {
    await this.expireSubscriptions();

    const exist = await this.prisma.user_subscriptions.findUnique({
      where: { id: Number(id) },
      select: { id: true },
    });

    if (!exist) throw new NotFoundException('Obuna topilmadi');

    await this.prisma.user_subscriptions.update({
      where: { id: Number(id) },
      data: { status: subscriptionStatus.EXPIRED },
    });

    return { success: true, message: "Obuna o'chirildi" };
  }
}
