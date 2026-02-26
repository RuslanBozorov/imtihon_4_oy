import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreatePlanDto } from './dto/subcription.dto';
import { UpdateDto } from './dto/update.dto';

@Injectable()
export class SubscriptionPlanService {
  constructor(private prisma: PrismaService) {}

  async getAllSubscription() {
    const data = await this.prisma.subscription_plan.findMany({
      where: { is_active: true },
      select: {
        id: true,
        name: true,
        price: true,
        duration_days: true,
        features: true,
        is_active: true,
        created_at: true,
      },
    });

    if (data.length === 0)
      throw new NotFoundException("Subscription plans not found");

    return {
      success: true,
      message: "All plans",
      data,
    };
  }

  async getMyPlan(currentUser: { id: number }) {
    const data = await this.prisma.user_subscriptions.findFirst({
      where: {
        user_id: currentUser.id,
        status: "ACTIVE",
      },
      select: {
        id: true,
        start_date: true,
        end_date: true,
        status: true,
        auto_renew: true,
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
    });

    if (!data)
      throw new NotFoundException("Sizda aktiv obuna mavjud emas");

    return {
      success: true,
      message: "My active plan",
      data,
    };
  }

  async getOnePlan(id: number) {
    const data = await this.prisma.subscription_plan.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        name: true,
        price: true,
        duration_days: true,
        features: true,
        is_active: true,
        created_at: true,
      },
    });

    if (!data) throw new NotFoundException("Bunday plan yo'q");

    return {
      success: true,
      message: "Single plan",
      data,
    };
  }

  async getActivePlan() {
    const data = await this.prisma.subscription_plan.findMany({
      where: { is_active: true },
      select: {
        id: true,
        name: true,
        price: true,
        duration_days: true,
        features: true,
        created_at: true,
      },
    });

    if (data.length === 0)
      throw new NotFoundException("Active plans not found");

    return {
      success: true,
      message: "Active plans",
      data,
    };
  }

  async getInActivePlan() {
    const data = await this.prisma.subscription_plan.findMany({
      where: { is_active: false },
      select: {
        id: true,
        name: true,
        price: true,
        duration_days: true,
        features: true,
        created_at: true,
      },
    });

    if (data.length === 0)
      throw new NotFoundException("Inactive plans not found");

    return {
      success: true,
      message: "Inactive plans",
      data,
    };
  }

  async createSubscription(payload: CreatePlanDto) {
    const exist = await this.prisma.subscription_plan.findFirst({
      where: { name: payload.name },
    });

    if (exist)
      throw new ConflictException("Bu obuna allaqachon mavjud");

    const data = await this.prisma.subscription_plan.create({
      data: {
        name: payload.name,
        price: payload.price,
        duration_days: payload.duration_days,
        features: payload.features,
        is_active: payload.is_active ?? true,
      },
      select: {
        id: true,
        name: true,
        price: true,
        duration_days: true,
        features: true,
        is_active: true,
        created_at: true,
      },
    });

    return {
      success: true,
      message: "Plan yaratildi",
      data,
    };
  }

  async updatePlan(id: number, payload: UpdateDto) {
    const exist = await this.prisma.subscription_plan.findUnique({
      where: { id: Number(id) },
    });

    if (!exist) throw new NotFoundException("Bunday plan yo'q");

    const data: Record<string, unknown> = {};

    if (payload.is_active !== undefined) {
      data.is_active = payload.is_active;
    }

    if (payload.features !== undefined) {
      if (typeof payload.features === 'string') {
        const trimmed = payload.features.trim();
        if (trimmed !== '') {
          data.features = payload.features;
        }
      } else {
        data.features = payload.features;
      }
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException("Yangilash uchun ma'lumot yuborilmadi");
    }

    const updated = await this.prisma.subscription_plan.update({
      where: { id: Number(id) },
      data,
      select: {
        id: true,
        name: true,
        price: true,
        duration_days: true,
        features: true,
        is_active: true,
        update_at:true
      },
    });

    return {
      success: true,
      message: "Plan yangilandi",
      data: updated,
    };
  }

  async deletePlan(id: number) {
    const exist = await this.prisma.subscription_plan.findUnique({
      where: { id: Number(id) },
    });

    if (!exist) throw new NotFoundException("Bunday plan yo'q");

    const deleted = await this.prisma.subscription_plan.update({
      where: { id: Number(id) },
      data: { is_active: false },
      select: {
        id: true,
        name: true,
        is_active: true,
      },
    });

    return {
      success: true,
      message: "Plan o'chirildi",
      data: deleted,
    };
  }
}
