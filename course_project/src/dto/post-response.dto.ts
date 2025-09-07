import { ApiProperty } from "@nestjs/swagger";

export class PostResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: "This is my first post!" })
    text: string;

    @ApiProperty({ example: 1 })
    userId: number;

    @ApiProperty({ example: "2025-01-01T00:01:00.000Z" })
    createdAt: Date;
}
