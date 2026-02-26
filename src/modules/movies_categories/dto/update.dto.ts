import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

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

export class UpdateMoviesCategoryDto {
  @ApiProperty()
  @IsOptional()
  @Transform(toOptionalNumber)
  @IsNumber()
  movie_id?: number;
  @ApiProperty()
  @IsOptional()
  @Transform(toOptionalNumber)
  @IsNumber()
  category_id?: number;
}
