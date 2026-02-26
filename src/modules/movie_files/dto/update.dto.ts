import { FileQuality } from "@prisma/client"
import { Transform } from "class-transformer"
import { IsEnum, IsOptional, IsString } from "class-validator"

const toOptionalTrimmedString = ({ value }: { value: unknown }) => {
    if (typeof value !== "string") {
        return value
    }

    const trimmed = value.trim()
    return trimmed === "" ? undefined : trimmed
}

export class MovieFilesUpdateDto {
    @IsOptional()
    @Transform(toOptionalTrimmedString)
    @IsEnum(FileQuality)
    quality?: FileQuality

    @IsOptional()
    @Transform(toOptionalTrimmedString)
    @IsString()
    language?: string
}
