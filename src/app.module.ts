import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProfileModule } from './modules/profile/profile.module';
import { SubscriptionPlanModule } from './modules/subscription_plan/subscription_plan.module';
import { UserSubscriptionsModule } from './modules/user_subscriptions/user_subscriptions.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { MoviesModule } from './modules/movies/movies.module';
import { MoviesCategoriesModule } from './modules/movies_categories/movies_categories.module';
import { MovieFilesModule } from './modules/movie_files/movie_files.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { WatchHistroyModule } from './modules/watch_histroy/watch_histroy.module';
import { AuthModule } from './modules/auth/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './core/database/prisma.module';
import { RoleGuard } from './common/guards/role.guard';
import { UsersModule } from './modules/users/users.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
    rootPath: join(process.cwd(), 'src', 'uploads', 'avatar'),
    serveRoot: '/files',
  },
  {
    rootPath: join(process.cwd(), 'src', 'uploads', 'movies'),
    serveRoot: '/poster_url',
  },
{
    rootPath: join(process.cwd(), 'src', 'uploads', 'videos'),
    serveRoot: '/video_url',
  },
),
    AuthModule,
    UsersModule,
    ProfileModule,
    SubscriptionPlanModule,
    UserSubscriptionsModule,
    PaymentsModule,
    CategoriesModule,
    MoviesModule,
    MoviesCategoriesModule,
    MovieFilesModule,
    FavoritesModule,
    ReviewsModule,
    WatchHistroyModule,
    PrismaModule,
    
  ],

  providers: [RoleGuard],
})
export class AppModule {}
