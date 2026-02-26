import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";

export class UpdateDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    is_active?: boolean;


    @ApiPropertyOptional({example:["SD sifatli kinolar", "Reklama bilan"]})
    @IsOptional()
    features?: any;
}