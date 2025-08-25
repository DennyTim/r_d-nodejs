import { IsString, IsNumber, IsOptional, IsPositive, MinLength } from 'class-validator';

export class CreateProductDto {
    @IsString()
    @MinLength(1)
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    price: number;

    @IsString()
    @IsOptional()
    category?: string;
}
