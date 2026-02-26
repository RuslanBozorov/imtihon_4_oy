import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Status } from '@prisma/client';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreateCategoriesDto } from './dto/create.dto';
import { UpdateCategoriesDto } from './dto/update.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  private validateSlug(slug: string): string {
    if (!slug) {
      throw new BadRequestException("Slug bo'sh bo'lishi mumkin emas");
    }

    return slug;
  }

  async createCategory(payload: CreateCategoriesDto) {
    const name = payload.name.trim();
    const description = payload.description.trim();
    const slug = this.validateSlug(this.generateSlug(payload.slug ?? name));

    const existBySlug = await this.prisma.categories.findUnique({
      where: { slug },
      select: { id: true, status: true },
    });

    if (existBySlug && existBySlug.status === Status.ACTIVE) {
      throw new ConflictException('Bunday category mavjud!');
    }

    if (existBySlug && existBySlug.status === Status.INACTIVE) {
      const reactivated = await this.prisma.categories.update({
        where: { id: existBySlug.id },
        data: {
          name,
          slug,
          description,
          status: Status.ACTIVE,
        },
      });

      return {
        success: true,
        message: 'Category qayta aktiv qilindi',
        data: reactivated,
      };
    }

    const existActiveByName = await this.prisma.categories.findFirst({
      where: {
        name,
        status: Status.ACTIVE,
      },
      select: { id: true },
    });

    if (existActiveByName) {
      throw new ConflictException('Bunday category mavjud!');
    }

    const created = await this.prisma.categories.create({
      data: {
        name,
        slug,
        description,
        status: Status.ACTIVE,
      },
    });

    return {
      success: true,
      message: 'Category yaratildi',
      data: created,
    };
  }

  async getAllCategorys() {
    const existCategory = await this.prisma.categories.findMany({
      where: { status: Status.ACTIVE },
    });

    if (existCategory.length === 0) {
      throw new NotFoundException('Kategoryalar yaratilmagan!');
    }

    return {
      success: true,
      message: 'Barcha kategoryalar',
      data: existCategory,
    };
  }

  async getOneCategory(id: number) {
    const existCategory = await this.prisma.categories.findFirst({
      where: {
        id: Number(id),
        status: Status.ACTIVE,
      },
    });

    if (!existCategory) {
      throw new NotFoundException('Kategorya topilmadi!');
    }

    return {
      success: true,
      message: 'Bitta kategoriya',
      data: existCategory,
    };
  }

  async updateCategory(id: number, payload: UpdateCategoriesDto) {
    const category = await this.prisma.categories.findFirst({
      where: {
        id: Number(id),
        status: Status.ACTIVE,
      },
    });

    if (!category) {
      throw new NotFoundException('Category topilmadi');
    }

    const name = payload.name?.trim() ?? category.name;
    const description = payload.description?.trim() ?? category.description;
    const slug = this.validateSlug(
      this.generateSlug(payload.slug ?? payload.name ?? category.slug),
    );

    const duplicateSlug = await this.prisma.categories.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (duplicateSlug && duplicateSlug.id !== Number(id)) {
      throw new ConflictException('Bunday category mavjud!');
    }

    const duplicateActiveName = await this.prisma.categories.findFirst({
      where: {
        name,
        status: Status.ACTIVE,
        NOT: { id: Number(id) },
      },
      select: { id: true },
    });

    if (duplicateActiveName) {
      throw new ConflictException('Bunday category mavjud!');
    }

    const updatedCategory = await this.prisma.categories.update({
      where: { id: Number(id) },
      data: {
        name,
        slug,
        description,
      },
    });

    return {
      success: true,
      message: 'Category yangilandi',
      data: updatedCategory,
    };
  }

  async deleteCategory(id: number) {
    const category = await this.prisma.categories.findFirst({
      where: {
        id: Number(id),
        status: Status.ACTIVE,
      },
    });

    if (!category) {
      throw new NotFoundException('Category topilmadi');
    }

    const data = await this.prisma.categories.update({
      where: { id: Number(id) },
      data: { status: Status.INACTIVE },
    });

    return {
      success: true,
      message: "Kategorya o'chirildi",
      data: data,
    };
  }
}
