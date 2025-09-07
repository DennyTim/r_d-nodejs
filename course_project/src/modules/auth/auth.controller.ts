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
import { LoginDto } from "../../dto/login.dto";
import { AuthService } from "../../services/auth.service";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {
    }

    @Post("token")
    @ApiOperation({ summary: "Login and get access token" })
    @ApiResponse({ status: 200, description: "Login successful" })
    @ApiResponse({ status: 401, description: "Invalid credentials" })
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }
}
