import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Status } from '@prisma/client';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreateDto } from './dto/create.dto';
import { UpdateMoviesCategoryDto } from './dto/update.dto';
   
@Injectable()
export class MoviesCategoriesService {
    constructor(private prisma:PrismaService){}
    
    private readonly selectData = {
      id: true,
      movie_id: true,
      category_id: true,
      movie: {
        select: {
          id: true,
          title: true,
          slug: true,
          rating: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    } as const;

    async getAll() {
        const data = await this.prisma.movies_categories.findMany({
            select: this.selectData,
            orderBy: { id: 'desc' },
        });

        if (data.length === 0) {
            throw new NotFoundException("Movie categorylar topilmadi");
        }

        return {
            success: true,
            message: 'Barcha movie categorylar',
            data,
        };
    }

    async getOne(id: number) {
        const item = await this.prisma.movies_categories.findUnique({
            where: { id: Number(id) },
            select: this.selectData,
        });

        if (!item) {
            throw new NotFoundException('Movie category topilmadi');
        }

        return {
            success: true,
            message: 'Bitta movie category',
            data: item,
        };
    }

    async create(payload: CreateDto) {
        const movie = await this.prisma.movies.findUnique({
            where: { id: Number(payload.movie_id) },
        });

        if (!movie) {
            throw new NotFoundException('Movie topilmadi');
        }

        const category = await this.prisma.categories.findFirst({
            where: { id: Number(payload.category_id), status: Status.ACTIVE },
        });

        if (!category) {
            throw new NotFoundException('Category topilmadi');
        }

        const exists = await this.prisma.movies_categories.findFirst({
            where: {
                movie_id: Number(payload.movie_id),
                category_id: Number(payload.category_id),
            },
        });

        if (exists) {
            throw new ConflictException("Bu movie ushbu categoryaga oldin qo'shilgan");
        }

        const created = await this.prisma.movies_categories.create({
            data: {
                movie_id: Number(payload.movie_id),
                category_id: Number(payload.category_id),
            },
            select: this.selectData,
        });

        return {
            success: true,
            message: 'Movie category yaratildi',
            data: created,
        };
    }

    async update(id: number, payload: UpdateMoviesCategoryDto) {
        const exist = await this.prisma.movies_categories.findUnique({
            where: { id: Number(id) },
            select: { id: true, movie_id: true, category_id: true },
        });

        if (!exist) {
            throw new NotFoundException('Movie category topilmadi');
        }

        if (payload.movie_id === undefined && payload.category_id === undefined) {
            throw new BadRequestException("Yangilash uchun ma'lumot yuborilmadi");
        }

        const nextMovieId = payload.movie_id ?? exist.movie_id;
        const nextCategoryId = payload.category_id ?? exist.category_id;

        if (payload.movie_id !== undefined) {
            const movie = await this.prisma.movies.findUnique({
                where: { id: Number(payload.movie_id) },
                select: { id: true },
            });

            if (!movie) {
                throw new NotFoundException('Movie topilmadi');
            }
        }

        if (payload.category_id !== undefined) {
            const category = await this.prisma.categories.findFirst({
                where: { id: Number(payload.category_id), status: Status.ACTIVE },
                select: { id: true },
            });

            if (!category) {
                throw new NotFoundException('Category topilmadi');
            }
        }

        const duplicate = await this.prisma.movies_categories.findFirst({
            where: {
                movie_id: Number(nextMovieId),
                category_id: Number(nextCategoryId),
                NOT: { id: Number(id) },
            },
            select: { id: true },
        });

        if (duplicate) {
            throw new ConflictException("Bu movie ushbu categoryaga oldin qo'shilgan");
        }

        const updated = await this.prisma.movies_categories.update({
            where: { id: Number(id) },
            data: {
                movie_id: Number(nextMovieId),
                category_id: Number(nextCategoryId),
            },
            select: this.selectData,
        });

        return {
            success: true,
            message: 'Movie category yangilandi',
            data: updated,
        };
    }

    async delete(id: number) {
        const exist = await this.prisma.movies_categories.findUnique({
            where: { id: Number(id) },
            select: { id: true },
        });

        if (!exist) {
            throw new NotFoundException('Movie category topilmadi');
        }

        const deleted = await this.prisma.movies_categories.delete({
            where: { id: Number(id) },
            select: this.selectData,
        });

        return {
            success: true,
            message: "Movie category o'chirildi",
            data: deleted,
        };
    }
}
