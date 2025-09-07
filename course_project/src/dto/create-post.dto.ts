import { ApiProperty } from "@nestjs/swagger";
import {
    IsNotEmpty,
    IsString,
    MaxLength
} from "class-validator";

export class CreatePostDto {
    @ApiProperty({
        example: "This is my first post!",
        description: "Post content",
        maxLength: 1000
    })
    @IsString()
    @IsNotEmpty({ message: "Post text cannot be empty" })
    @MaxLength(1000, { message: "Post text cannot be longer than 1000 characters" })
    text: string;
}
