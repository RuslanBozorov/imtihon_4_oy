import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class WatchHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async saveWatchHistory(
    userId: number,
    movieId: number,
    watchedDuration: number,
  ) {
    const user = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User topilmadi');
    }

    const movie = await this.prisma.movies.findUnique({
      where: { id: movieId },
      select: { id: true, duration_minutes: true },
    });

    if (!movie) {
      throw new NotFoundException('Movie topilmadi');
    }

    if (!Number.isFinite(watchedDuration) || watchedDuration < 0) {
      throw new BadRequestException("Duration manfiy bo'lishi mumkin emas");
    }

    const percentage = Math.min(
      movie.duration_minutes > 0
        ? (watchedDuration / movie.duration_minutes) * 100
        : 0,
      100,
    );

    const existingHistory = await this.prisma.watch_histroy.findFirst({
      where: {
        user_id: userId,
        movie_id: movieId,
      },
      select: { id: true },
    });

    const result = existingHistory
      ? await this.prisma.watch_histroy.update({
          where: { id: existingHistory.id },
          data: {
            watched_duration: watchedDuration,
            watched_percentage: percentage,
            last_watched: new Date(),
          },
        })
      : await this.prisma.watch_histroy.create({
          data: {
            user_id: userId,
            movie_id: movieId,
            watched_duration: watchedDuration,
            watched_percentage: percentage,
          },
        });

    return {
      success: true,
      message: 'Watch history saqlandi',
      data: result,
    };
  }
}
