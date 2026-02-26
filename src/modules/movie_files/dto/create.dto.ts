import { FileQuality } from "@prisma/client"
import { IsEnum, IsNumber, IsString } from "class-validator"

export class MovieFilesCreateDto{
    @IsEnum(FileQuality)
    quality:FileQuality
    @IsString()
    language:string   
}