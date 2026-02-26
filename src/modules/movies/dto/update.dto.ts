import { PartialType } from '@nestjs/mapped-types';
import { MoviesCreateDto } from './create.dto';
import { IsOptional, IsString, IsInt, IsNumber, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

const toOptionalTrimmedString = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};

const toOptionalNumber = ({ value }: { value: unknown }) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') {
      return undefined;
    }

    const parsed = Number(trimmed);
    return Number.isNaN(parsed) ? value : parsed;
  }

  return value;
};

export class UpdateMovieDto extends PartialType(MoviesCreateDto) {
  
  @IsOptional()
  @Transform(toOptionalTrimmedString)
  @IsString()
  title?: string;

  @IsOptional()
  @Transform(toOptionalTrimmedString)
  @IsString()
  slug?: string;

  @IsOptional()
  @Transform(toOptionalTrimmedString)
  @IsString()
  description?: string;

  @IsOptional()
  @Transform(toOptionalNumber)
  @IsInt()
  release_year?: number;

  @IsOptional()
  @Transform(toOptionalNumber)
  @IsInt()
  duration_minutes?: number;

  @IsOptional()
  @Transform(toOptionalNumber)
  @IsNumber({ maxDecimalPlaces: 1 }) 
  @Min(0)
  @Max(5)
  rating?: number;

  @IsOptional()
  @Transform(toOptionalTrimmedString)
  @IsString()
  poster_url?: string;
}
