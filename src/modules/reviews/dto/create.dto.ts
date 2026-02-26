import { ApiProperty } from "@nestjs/swagger"
import { IsNumber, IsString } from "class-validator"

export class ReviewsCreateDto {
    @ApiProperty()
    @IsNumber()
    user_id:number  
    @ApiProperty()
    @IsNumber()
    movie_id:number
    @ApiProperty()
    @IsNumber()
    rating:number
    @ApiProperty()
    @IsString()
    comment:string
}