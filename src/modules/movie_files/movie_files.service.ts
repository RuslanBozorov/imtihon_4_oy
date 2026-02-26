import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { MovieFilesCreateDto } from './dto/create.dto';
import { MovieFilesUpdateDto } from './dto/update.dto';

@Injectable()
export class MovieFilesService {
    constructor(private prisma: PrismaService) { }

    async createMovieFile(movieId: number, payload: MovieFilesCreateDto, filename: string) {

        const existMovieFile = await this.prisma.movies.findUnique({ where: { id: movieId } })

        if (!existMovieFile) {
            throw new NotFoundException("Movie topilmadi!")
        }
        const url = `http://localhost:3000/video_url/${filename}`
        const newFile = await this.prisma.movie_files.create(
            {
                data: {
                    movie_id: movieId,
                    quality: payload.quality,
                    file_url: url,
                    language: payload.language
                }
            }
        )

        return {
            success: true,
            message: "MovieFile yaratildi",
            data: newFile
        }
    }


    async getAllMovieFile() {
        const existFile = await this.prisma.movie_files.findMany()

        if (!existFile) {
            throw new NotFoundException("Movie topilmadi!")
        }

        return {
            success: true,
            message: "Barcha moviefillar",
            data: existFile
        }
    }

    async getOneMovieFile(id: number) {
        const existFile = await this.prisma.movie_files.findUnique({ where: { id: Number(id) } })

        if (!existFile) {
            throw new NotFoundException("MovieFile topilmadi!")
        }

        return {
            success: true,
            message: "MovieFile",
            data: existFile
        }
    }


    async updateMovieFile(id: number, payload: MovieFilesUpdateDto, filename?: string) {
        const existFile = await this.prisma.movie_files.findUnique({ where: { id: Number(id) } })

        if (!existFile) {
            throw new NotFoundException("MovieFile topilmadi!")
        }

        // Faqat yuborilgan fieldlarni yangilaymiz
        const data: Record<string, any> = {}

        if (payload.quality !== undefined) {
            data.quality = payload.quality
        }

        if (payload.language !== undefined) {
            data.language = payload.language
        }

        if (filename) {
            data.file_url = `http://localhost:3000/video_url/${filename}`
        }

        // Agar hech narsa yuborilmagan bo'lsa, xato qaytaramiz
        if (Object.keys(data).length === 0) {
            throw new BadRequestException("Yangilash uchun kamida bitta maydon yuboring!")
        }

        const updatedFile = await this.prisma.movie_files.update({
            where: { id: Number(id) },
            data
        })

        return {
            success: true,
            message: "MovieFile updated",
            data: updatedFile
        }
    }

    async deleteMovieFile(id: number) {
        const existFile = await this.prisma.movie_files.findUnique({ where: { id: Number(id) } })

        if (!existFile) {
            throw new NotFoundException("MovieFile topilmadi!")
        }
        const deletedFile = await this.prisma.movie_files.delete({ where: { id: Number(id) } })

        return {
            success: true,
            message: "MovieFile deleted",
            data: deletedFile
        }
    }

}
