import {
    Injectable,
    UnauthorizedException
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { LoginDto } from "../dto/login.dto";
import { UsersService } from "./users.service";

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) {
    }

    async login(loginDto: LoginDto): Promise<{ access_token: string }> {
        const user = await this.usersService.findByEmail(loginDto.email);

        if (!user) {
            throw new UnauthorizedException("Invalid credentials");
        }

        const isPasswordValid = await this.usersService.validatePassword(
            loginDto.password,
            user.passwordHash
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException("Invalid Credentials");
        }

        const payload = { email: user.email, sub: user.id };

        return {
            access_token: this.jwtService.sign(payload)
        };
    }
}
