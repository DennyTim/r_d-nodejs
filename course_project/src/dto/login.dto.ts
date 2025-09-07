import { ApiProperty } from "@nestjs/swagger";
import {
    IsEmail,
    IsNotEmpty,
    IsString
} from "class-validator";

export class LoginDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'User email address'
    })
    @IsEmail({}, { message: 'Email must be a valid email address' })
    email: string;

    @ApiProperty({
        example: 'password123',
        description: 'User password'
    })
    @IsString()
    @IsNotEmpty({ message: 'Password cannot be empty' })
    password: string;
}
