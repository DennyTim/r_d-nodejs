import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
    IsNumberString,
    IsOptional
} from "class-validator";

export class GetPostsQueryDto {
    @ApiProperty({
        example: "1",
        description: "User ID to filter posts",
        required: true
    })
    @IsNumberString({}, { message: "userId must be a valid number" })
    @Transform(({ value }: { value: number }): string => value?.toString())
    userId: string;

    @ApiProperty({
        example: "10",
        description: "Number of posts to return (default: 20)",
        required: false
    })
    @IsOptional()
    @IsNumberString({}, { message: "limit must be a valid number" })
    @Transform(({ value }: { value: number }): string => value?.toString())
    limit?: string;

    @ApiProperty({
        example: '0',
        description: 'Number of posts to skip (default: 0)',
        required: false
    })
    @IsOptional()
    @IsNumberString({}, { message: 'offset must be a valid number' })
    @Transform(({ value }: { value: number }): string => value?.toString())
    offset?: string;
}
