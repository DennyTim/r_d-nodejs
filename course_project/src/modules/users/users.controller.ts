import {
    Body,
    Controller,
    Post
} from "@nestjs/common";
import {
    ApiOperation,
    ApiResponse,
    ApiTags
} from "@nestjs/swagger";
import { CreateUserDto } from "../../dto/create-user.dto";
import { UsersService } from "../../services/users.service";

@ApiTags("users")
@Controller("users")
export class UsersController {
    constructor(private readonly usersService: UsersService) {
    }

    @Post()
    @ApiOperation({ summary: "Create a new user" })
    @ApiResponse({ status: 201, description: "User created successfully" })
    @ApiResponse({ status: 409, description: "User with this email already exists" })
    async create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }
}
