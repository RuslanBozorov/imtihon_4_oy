import { subscriptionStatus } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class UpdateUserSubscriptionDto {
  @ApiPropertyOptional({ example: 1 })
  @IsNumber()
  @IsOptional()
  user_id?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsNumber()
  @IsOptional()
  plan_id?: number;

  @ApiPropertyOptional({
    enum: subscriptionStatus,
    example: subscriptionStatus.ACTIVE,
  })
  @IsEnum(subscriptionStatus)
  @IsOptional()
  status?: subscriptionStatus;

  @ApiPropertyOptional({ example: '2026-02-24T10:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  start_date?: string;

  @ApiPropertyOptional({ example: '2026-03-24T10:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  end_date?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  auto_renew?: boolean;
}

export class UpdateMyUserSubscriptionDto {
  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  auto_renew?: boolean;
}
