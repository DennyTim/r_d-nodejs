import { ApiProperty } from "@nestjs/swagger";

export class UserResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({example: 'user@example.com'})
    email: string;

    @ApiProperty({ example: '2025-01-01T00:01:00.000Z'})
    createdAt: Date;
}
