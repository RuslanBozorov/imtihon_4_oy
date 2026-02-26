import { FileQuality } from "@prisma/client"
import { IsEnum, IsOptional, IsString } from "class-validator"

export class MovieFilesUpdateDto {
    @IsOptional()
    @IsEnum(FileQuality)
    quality?: FileQuality

    @IsOptional()
    @IsString()
    language?: string
}
