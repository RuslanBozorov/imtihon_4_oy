import { Transform, Type } from 'class-transformer';
import {
  IsIn,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { moviesStatus } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetMoviesQueryDto {
  @ApiPropertyOptional({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ example: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ example: 'action' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: 'interstellar' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ enum: moviesStatus, example: moviesStatus.PREMIUM })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsEnum(moviesStatus)
  @IsOptional()
  subscription_type?: moviesStatus;

  @ApiPropertyOptional({ example: 'desc', enum: ['asc', 'desc'] })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsIn(['asc', 'desc'])
  @IsString()
  @IsOptional()
  order?: 'asc' | 'desc';
}
