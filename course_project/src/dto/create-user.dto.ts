import { ApiProperty } from "@nestjs/swagger";
import {
    IsEmail,
    IsString,
    MinLength
} from "class-validator";

export class CreateUserDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'User email address'
    })
    @IsEmail({}, { message: 'Email must be a valid email address'})
    email: string;

    @ApiProperty({
        example: 'password123',
        minLength: 6,
        description: 'User password (minimum 6 characters)'
    })
    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string;
}
