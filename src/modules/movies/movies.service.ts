import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { moviesStatus, Prisma, Status, subscriptionStatus } from '@prisma/client';
import { PrismaService } from 'src/core/database/prisma.service';
import { MoviesCreateDto } from './dto/create.dto';
import { UpdateMovieDto } from './dto/update.dto';
import { GetMoviesQueryDto } from './dto/query.dto';

@Injectable()
export class MoviesService {
  constructor(private prisma: PrismaService) {}

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  private toPosterUrl(value: string): string {
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return value;
    }

    return `http://localhost:3000/poster_url/${value}`;
  }

  private toMovieResponse<T extends { rating: Prisma.Decimal | number | string; poster_url: string }>(
    movie: T,
  ) {
    return {
      ...movie,
      rating: Number(movie.rating),
      poster_url: this.toPosterUrl(movie.poster_url),
    };
  }

  private normalizeCategories(categories: string[]) {
    const unique = new Map<string, string>();

    for (const item of categories) {
      const name = item?.trim();

      if (!name) {
        continue;
      }

      const slug = this.generateSlug(name);

      if (!slug) {
        continue;
      }

      if (!unique.has(slug)) {
        unique.set(slug, name);
      }
    }

    return [...unique.entries()].map(([slug, name]) => ({ slug, name }));
  }

  private async getOrCreateCategoryIds(
    tx: Prisma.TransactionClient,
    categories: string[],
  ): Promise<number[]> {
    const normalized = this.normalizeCategories(categories);

    if (normalized.length === 0) {
      throw new NotFoundException("Movie qo'shilmagan!")
    }

    const slugs = normalized.map((item) => item.slug);

    const existing = await tx.categories.findMany({
      where: { slug: { in: slugs } },
      select: { id: true, slug: true, status: true },
    });

    const existingSlugs = new Set(existing.map((item) => item.slug));
    const inactiveSlugs = existing
      .filter((item) => item.status === Status.INACTIVE)
      .map((item) => item.slug);

    if (inactiveSlugs.length > 0) {
      await tx.categories.updateMany({
        where: { slug: { in: inactiveSlugs } },
        data: { status: Status.ACTIVE },
      });
    }

    const toCreate = normalized
      .filter((item) => !existingSlugs.has(item.slug))
      .map((item) => ({
        name: item.name,
        slug: item.slug,
        description: `${item.name} category`,
      }));

    if (toCreate.length > 0) {
      await tx.categories.createMany({
        data: toCreate,
        skipDuplicates: true,
      });
    }

    const all = await tx.categories.findMany({
      where: { slug: { in: slugs } },
      select: { id: true },
    });

    return [...new Set(all.map((item) => item.id))];
  }

  async createMovie(payload: MoviesCreateDto, filename: string, user: { id: number }) {
    const slug = this.generateSlug(payload.slug);

    if (!slug) {
      throw new BadRequestException("Movie slug noto'g'ri");
    }

    if (!filename) {
      throw new BadRequestException("Movie uchun poster yuborilishi kerak");
    }

    const existMovie = await this.prisma.movies.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (existMovie) {
      throw new ConflictException("Bu kino oldin qo'shilgan!");
    }

    const created = await this.prisma.$transaction(async (tx) => {
      const movie = await tx.movies.create({
        data: {
          title: payload.title.trim(),
          slug,
          description: payload.description.trim(),
          release_year: payload.release_year,
          duration_minutes: payload.duration_minutes,
          rating: new Prisma.Decimal(payload.rating),
          subscription_type: payload.subscription_type,
          poster_url: filename,
          user: {
            connect: { id: user.id },
          },
        },
      });

      if (payload.categories !== undefined) {
        const categoryIds = await this.getOrCreateCategoryIds(tx, payload.categories);

        if (categoryIds.length > 0) {
          await tx.movies_categories.createMany({
            data: categoryIds.map((categoryId) => ({
              movie_id: movie.id,
              category_id: categoryId,
            })),
          });
        }
      }

      return movie;
    });

    return {
      success: true,
      message: 'Movie yaratildi',
      data: this.toMovieResponse(created),
    };
  }

  async getAll(query: GetMoviesQueryDto) {
    const hasPagination = query.page !== undefined || query.limit !== undefined;
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const andFilters: Prisma.MoviesWhereInput[] = [];

    if (query.subscription_type) {
      andFilters.push({ subscription_type: query.subscription_type });
    }

    if (query.search?.trim()) {
      const search = query.search.trim();
      andFilters.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    if (query.category?.trim()) {
      const category = query.category.trim();
      andFilters.push({
        moviesCategories: {
          some: {
            category: {
              OR: [
                { slug: { contains: category, mode: 'insensitive' } },
                { name: { contains: category, mode: 'insensitive' } },
              ],
            },
          },
        },
      });
    }

    const where: Prisma.MoviesWhereInput =
      andFilters.length > 0 ? { AND: andFilters } : {};

    const orderBy: Prisma.MoviesOrderByWithRelationInput = {
      created_at: query.order === 'asc' ? 'asc' : 'desc',
    };

    const movieSelect = Prisma.validator<Prisma.MoviesSelect>()({
      id: true,
      title: true,
      slug: true,
      description: true,
      poster_url: true,
      release_year: true,
      duration_minutes: true,
      rating: true,
      subscription_type: true,
      view_count: true,
      created_at: true,
      moviesCategories: {
        select: {
          category: { select: { name: true, slug: true } },
        },
      },
    });

    const [total, movies] = await Promise.all([
      this.prisma.movies.count({ where }),
      hasPagination
        ? this.prisma.movies.findMany({
            where,
            orderBy,
            skip,
            take: limit,
            select: movieSelect,
          })
        : this.prisma.movies.findMany({
            where,
            orderBy,
            select: movieSelect,
          }),
    ]);

    const mapped = movies.map((movie) => ({
      id: movie.id,
      title: movie.title,
      slug: movie.slug,
      description: movie.description,
      poster_url: this.toPosterUrl(movie.poster_url),
      release_year: movie.release_year,
      duration_minutes: movie.duration_minutes,
      rating: Number(movie.rating),
      subscription_type: movie.subscription_type,
      view_count: movie.view_count,
      created_at: movie.created_at,
      categories: movie.moviesCategories.map((item) => item.category.slug),
    }));

    return {
      success: true,
      data: {
        movies: mapped,
        pagination: {
          total,
          page: hasPagination ? page : 1,
          limit: hasPagination ? limit : total,
          pages: hasPagination ? Math.ceil(total / limit) : 1,
        },
      },
    };
  }

  async getOneMovies(id: number) {
    const movie = await this.prisma.movies.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        release_year: true,
        duration_minutes: true,
        poster_url: true,
        rating: true,
        subscription_type: true,
        view_count: true,
        created_at: true,
        moviesCategories: {
          select: {
            category: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!movie) {
      throw new NotFoundException('Movie topilmadi!');
    }

    return {
      success: true,
      message: 'Bitta movie',
      data: {
        id: movie.id,
        title: movie.title,
        slug: movie.slug,
        description: movie.description,
        release_year: movie.release_year,
        duration_minutes: movie.duration_minutes,
        poster_url: this.toPosterUrl(movie.poster_url),
        rating: Number(movie.rating),
        subscription_type: movie.subscription_type,
        view_count: movie.view_count,
        created_at: movie.created_at,
        categories: movie.moviesCategories.map((item) => item.category.slug),
      },
    };
  }

  async updateMovie(id: number, payload: UpdateMovieDto, filename?: string) {
    const existMovie = await this.prisma.movies.findUnique({
      where: { id: Number(id) },
      select: { id: true, slug: true },
    });

    if (!existMovie) {
      throw new NotFoundException('Movie topilmadi');
    }

    const { categories, ...restPayload } = payload;
    const dataToUpdate: Prisma.MoviesUpdateInput = {};

    if (restPayload.title !== undefined) {
      dataToUpdate.title = restPayload.title.trim();
    }

    if (restPayload.description !== undefined) {
      dataToUpdate.description = restPayload.description.trim();
    }

    if (restPayload.release_year !== undefined) {
      dataToUpdate.release_year = restPayload.release_year;
    }

    if (restPayload.duration_minutes !== undefined) {
      dataToUpdate.duration_minutes = restPayload.duration_minutes;
    }

    if (restPayload.subscription_type !== undefined) {
      dataToUpdate.subscription_type = restPayload.subscription_type;
    }

    if (restPayload.rating !== undefined) {
      dataToUpdate.rating = new Prisma.Decimal(restPayload.rating);
    }

    if (restPayload.slug !== undefined) {
      const normalizedSlug = this.generateSlug(restPayload.slug);

      if (!normalizedSlug) {
        throw new BadRequestException("Movie slug noto'g'ri");
      }

      const duplicate = await this.prisma.movies.findUnique({
        where: { slug: normalizedSlug },
        select: { id: true },
      });

      if (duplicate && duplicate.id !== Number(id)) {
        throw new ConflictException("Bu slug oldin ishlatilgan");
      }

      dataToUpdate.slug = normalizedSlug;
    }

    if (filename) {
      dataToUpdate.poster_url = filename;
    }

    if (Object.keys(dataToUpdate).length === 0 && categories === undefined) {
      throw new BadRequestException("Yangilash uchun kamida bitta maydon yuboring");
    }

    const updatedMovie = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.movies.update({
        where: { id: Number(id) },
        data: dataToUpdate,
      });

      if (categories !== undefined) {
        await tx.movies_categories.deleteMany({
          where: { movie_id: Number(id) },
        });

        const categoryIds = await this.getOrCreateCategoryIds(tx, categories);

        if (categoryIds.length > 0) {
          await tx.movies_categories.createMany({
            data: categoryIds.map((categoryId) => ({
              movie_id: Number(id),
              category_id: categoryId,
            })),
          });
        }
      }

      return updated;
    });

    return {
      success: true,
      message: 'Movie yangilandi',
      data: this.toMovieResponse(updatedMovie),
    };
  }

  async deleteMovie(id: number) {
    const existMovie = await this.prisma.movies.findUnique({
      where: { id: Number(id) },
    });

    if (!existMovie) {
      throw new NotFoundException('Movie topilmadi');
    }

    const deletedMovie = await this.prisma.movies.delete({
      where: { id: Number(id) },
    });

    return {
      success: true,
      message: "Movie o'chirildi",
      data: this.toMovieResponse(deletedMovie),
    };
  }

  async watchMovie(id: number, currentUser: { id: number }) {
    const movie = await this.prisma.movies.findUnique({
      where: { id: Number(id) },
    });

    if (!movie) {
      throw new NotFoundException('Movie topilmadi');
    }

    if (movie.subscription_type === moviesStatus.PREMIUM) {
      if (!currentUser?.id) {
        throw new UnauthorizedException("Premium kinoni ko'rish uchun login kerak");
      }

      const latestSubscription = await this.prisma.user_subscriptions.findFirst({
        where: {
          user_id: Number(currentUser.id),
        },
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          status: true,
          end_date: true,
        },
      });

      if (!latestSubscription) {
        throw new ForbiddenException("Premium kinoni ko'rish uchun aktiv obuna kerak");
      }

      if (
        latestSubscription.status === subscriptionStatus.CANCELED ||
        latestSubscription.status === subscriptionStatus.EXPIRED
      ) {
        throw new ForbiddenException("Obunangiz bekor qilingan yoki muddati tugagan");
      }

      if (
        latestSubscription.status !== subscriptionStatus.ACTIVE ||
        latestSubscription.end_date < new Date()
      ) {
        if (
          latestSubscription.status === subscriptionStatus.ACTIVE &&
          latestSubscription.end_date < new Date()
        ) {
          await this.prisma.user_subscriptions.update({
            where: { id: latestSubscription.id },
            data: { status: subscriptionStatus.EXPIRED },
          });
        }

        throw new ForbiddenException("Premium kinoni ko'rish uchun aktiv obuna kerak");
      }
    }

    const watchedMovie = await this.prisma.movies.update({
      where: { id: Number(id) },
      data: {
        view_count: {
          increment: 1,
        },
      },
    });

    return {
      success: true,
      message: "Movie ko'rildi",
      data: this.toMovieResponse(watchedMovie),
    };
  }
}
