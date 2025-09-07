import { ApiProperty } from "@nestjs/swagger";

export class ErrorResponseDto {
    @ApiProperty({ example: 400 })
    statusCode: number;

    @ApiProperty({ example: 'Bad Request'})
    error: string;

    @ApiProperty({
        example: ['email must be a valid email address'],
        description: 'Array of error messages'
    })
    message: string | string[];

    @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
    timestamp: string;

    @ApiProperty({ example: '/users' })
    path: string;
}
