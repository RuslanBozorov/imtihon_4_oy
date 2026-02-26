import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsOptional } from "class-validator";

const toOptionalBoolean = ({ value }: { value: unknown }) => {
    if (value === undefined || value === null) {
        return undefined
    }

    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase()
        if (normalized === "") {
            return undefined
        }
        if (normalized === "true") {
            return true
        }
        if (normalized === "false") {
            return false
        }
    }

    return value
}

const toOptionalFeatureValue = ({ value }: { value: unknown }) => {
    if (typeof value !== "string") {
        return value
    }

    const trimmed = value.trim()
    return trimmed === "" ? undefined : value
}

export class UpdateDto {
    @ApiPropertyOptional()
    @IsOptional()
    @Transform(toOptionalBoolean)
    @IsBoolean()
    is_active?: boolean;


    @ApiPropertyOptional({example:["SD sifatli kinolar", "Reklama bilan"]})
    @IsOptional()
    @Transform(toOptionalFeatureValue)
    features?: any;
}
