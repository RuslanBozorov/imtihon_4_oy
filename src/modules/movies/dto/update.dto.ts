import { PartialType } from '@nestjs/mapped-types';
import { MoviesCreateDto } from './create.dto';
import { IsOptional, IsString, IsInt, IsNumber, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateMovieDto extends PartialType(MoviesCreateDto) {
  
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  release_year?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  duration_minutes?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 }) 
  @Min(0)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  poster_url?: string;
}
