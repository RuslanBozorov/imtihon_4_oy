import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { FavoritesCreateDto } from './dto/create.dto';

@Injectable()
export class FavoritesService {
    constructor(private prisma: PrismaService) { }

    async createFavorite(user_id: number, payload: FavoritesCreateDto) {
        const existFavorite = await this.prisma.favorites.findMany({
            where: { movie_id: payload.movie_id, user_id }
        })

        if (existFavorite.length > 0) {
            throw new BadRequestException("Favorite mavjud!")
        }

        const newFavorite = await this.prisma.favorites.create({
            data: {
                movie_id: payload.movie_id,
                user_id,
            }
        })

        return {
            success: true,
            message: "Favorite yaratildi",
            data: newFavorite
        }
    }

    async getAllFavorites(user_id: number) {
        const all = await this.prisma.favorites.findMany({
            where: { user_id }
        });

        if (!all || all.length === 0) {
            throw new NotFoundException("favoriteslar mavjud emas");
        }

        return {
            success: true,
            data: all
        };
    }


    async getOneFavorite(id: number) {
        const existId = await this.prisma.favorites.findUnique({ where: { id: Number(id) } })

        if (!existId) {
            throw new NotFoundException("favorite topilmadi")
        }

        return {
            success: true,
            message: "favorite",
            data: existId
        }
    }


    async deleteFavorites(id: number) {
        const existId = await this.prisma.favorites.findUnique({ where: { id: Number(id) } })

        if (!existId) {
            throw new NotFoundException("favorite topilmadi")
        }

        const data = await this.prisma.favorites.delete({
            where: { id: Number(id) }
        })

        return {
            success: true,
            message: "favorite o'chirildi",
            data: data
        }
    }
}
