import { ApiProperty } from "@nestjs/swagger";

export class ValidationErrorDto {
    @ApiProperty({ example: 400 })
    statusCode: number;

    @ApiProperty({
        example: [
            "email must be a valid email address",
            "password must be at least 6 characters long"
        ]
    })
    message: string[];

    @ApiProperty({ example: 'Bad Request'})
    error: string;
}
