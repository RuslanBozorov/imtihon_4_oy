import { ApiProperty } from "@nestjs/swagger"
import { IsNumber } from "class-validator"

export class CreateDto {
    @ApiProperty()
    @IsNumber()
    movie_id: number
    @ApiProperty()
    @IsNumber()
    category_id: number
}