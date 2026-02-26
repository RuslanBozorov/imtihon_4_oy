import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class CreateUserSubscriptionDto {
  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  user_id?: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  plan_id: number;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  auto_renew?: boolean;
}

