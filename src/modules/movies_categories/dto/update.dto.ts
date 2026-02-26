import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class UpdateMoviesCategoryDto {
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  movie_id?: number;
  @ApiProperty()
  @IsOptional()
  @IsNumber()
  category_id?: number;
}
