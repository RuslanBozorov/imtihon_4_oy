import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, MinLength } from 'class-validator';

const toOptionalTrimmedString = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Ali' })
  @IsOptional()
  @Transform(toOptionalTrimmedString)
  @IsString()
  @MinLength(3)
  username?: string;

  @ApiPropertyOptional({ example: 'ali@gmail.com' })
  @IsOptional()
  @Transform(toOptionalTrimmedString)
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: 'Ali1234' })
  @IsOptional()
  @Transform(toOptionalTrimmedString)
  @IsString()
  password?: string;
}
