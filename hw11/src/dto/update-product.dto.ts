import {
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    MinLength
} from "class-validator";

export class UpdateProductDto {
    @IsString()
    @IsOptional()
    @MinLength(1)
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    @IsOptional()
    price?: number;

    @IsString()
    @IsOptional()
    category?: string;
}
