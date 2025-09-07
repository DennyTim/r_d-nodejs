import {
    Injectable,
    UnauthorizedException
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import {
    ExtractJwt,
    Strategy
} from "passport-jwt";
import { UsersService } from "./users.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private usersService: UsersService,
        configService: ConfigService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>("JWT_SECRET")
        });
    }

    async validate(payload: { email: string }) {
        const user = await this.usersService.findByEmail(payload.email);

        if (!user) {
            throw new UnauthorizedException();
        }

        return { id: user.id, email: user.email };
    }
}
