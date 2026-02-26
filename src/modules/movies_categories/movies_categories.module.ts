import { Module } from '@nestjs/common';
import { MoviesCategoriesController } from './movies_categories.controller';
import { MoviesCategoriesService } from './movies_categories.service';

@Module({
  controllers: [MoviesCategoriesController],
  providers: [MoviesCategoriesService],
})
export class MoviesCategoriesModule {}
