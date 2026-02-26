import { subscriptionStatus } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
} from 'class-validator';

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

const toOptionalTrimmedString = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};

const toOptionalBoolean = ({ value }: { value: unknown }) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === '') {
      return undefined;
    }
    if (normalized === 'true') {
      return true;
    }
    if (normalized === 'false') {
      return false;
    }
  }

  return value;
};

export class UpdateUserSubscriptionDto {
  @ApiPropertyOptional({ example: 1 })
  @Transform(toOptionalNumber)
  @IsNumber()
  @IsOptional()
  user_id?: number;

  @ApiPropertyOptional({ example: 2 })
  @Transform(toOptionalNumber)
  @IsNumber()
  @IsOptional()
  plan_id?: number;

  @ApiPropertyOptional({
    enum: subscriptionStatus,
    example: subscriptionStatus.ACTIVE,
  })
  @Transform(toOptionalTrimmedString)
  @IsEnum(subscriptionStatus)
  @IsOptional()
  status?: subscriptionStatus;

  @ApiPropertyOptional({ example: '2026-02-24T10:00:00.000Z' })
  @Transform(toOptionalTrimmedString)
  @IsDateString()
  @IsOptional()
  start_date?: string;

  @ApiPropertyOptional({ example: '2026-03-24T10:00:00.000Z' })
  @Transform(toOptionalTrimmedString)
  @IsDateString()
  @IsOptional()
  end_date?: string;

  @ApiPropertyOptional({ example: true })
  @Transform(toOptionalBoolean)
  @IsBoolean()
  @IsOptional()
  auto_renew?: boolean;
}

export class UpdateMyUserSubscriptionDto {
  @ApiPropertyOptional({ example: true })
  @Transform(toOptionalBoolean)
  @IsBoolean()
  @IsOptional()
  auto_renew?: boolean;
}
