import { moviesStatus } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

function parseCategories(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return [];
  }

  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return trimmed.split(',').map((item) => item.trim());
    }
  }

  return trimmed.split(',').map((item) => item.trim());
}

export class MoviesCreateDto{
  @IsString()
  @MinLength(1)
  title:string  
  @IsString()           
  @MinLength(1)
  slug:string  
  @IsString()                  
  @MinLength(1)
  description:string 
  @IsNumber()    
  @Type(()=>Number)  
  release_year:number   
  @IsNumber()
  @Type(()=>Number)  
  duration_minutes:number
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 }) 
  @Min(0)
  @Max(10)
  rating:number   
  @IsEnum(moviesStatus)
  subscription_type:moviesStatus

  @IsOptional()
  @Transform(({ value }) => parseCategories(value))
  @IsArray()
  @IsString({ each: true })
  categories?: string[];
}
