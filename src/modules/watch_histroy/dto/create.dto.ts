import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SaveWatchHistoryDto {
  @ApiProperty({ example: 320 })
  @IsNumber()
  @Min(0)
  watched_duration: number;
}
