import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsMobilePhone,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

const toOptionalTrimmedString = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};

export class CreateProfileDto {
  @ApiProperty({ example: 'Aliyev Vali' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  full_name: string;

  @ApiPropertyOptional({ example: '+998901234567' })
  @IsMobilePhone('uz-UZ')
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Uzbekistan' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  country?: string;
}

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Aliyev Vali' })
  @IsOptional()
  @Transform(toOptionalTrimmedString)
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  full_name?: string;

  @ApiPropertyOptional({ example: '+998901234567' })
  @Transform(toOptionalTrimmedString)
  @IsMobilePhone('uz-UZ')
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Uzbekistan' })
  @IsOptional()
  @Transform(toOptionalTrimmedString)
  @IsString()
  @MaxLength(50)
  country?: string;
}
