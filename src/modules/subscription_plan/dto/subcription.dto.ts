import { IsBoolean, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePlanDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    price: number;

    @ApiProperty()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    duration_days: number;

    @ApiPropertyOptional()
    @IsOptional()
    features: any;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    is_active: boolean;
}